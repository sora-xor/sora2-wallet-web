import { pipe, subscribe } from 'wonka';

import store from '../../../../store';
import { ConnectionStatus } from '../../../../types/common';
import { createExplorerClient } from '../client';

import type { Client, OperationResult, TypedDocumentNode, AnyVariables } from '../client';

export default class BaseSubsquidExplorer {
  public client!: Client;

  private handlePayloadStatus<T>(payload: OperationResult<T, any>) {
    if (payload.error || !payload.data) {
      this.updateConnectionStatus(ConnectionStatus.Unavailable);
    } else {
      this.updateConnectionStatus(ConnectionStatus.Available);
    }
  }

  private updateConnectionStatus(status: ConnectionStatus) {
    if (store.state.wallet.settings.subsquidStatus !== status) {
      store.commit.wallet.settings.setSubsquidStatus(status);
    }
  }

  public initClient() {
    if (this.client) return;

    const url = store.state.wallet.settings.subsquidEndpoint;

    if (!url) {
      this.updateConnectionStatus(ConnectionStatus.Unavailable);
      throw new Error('Subsquid endpoint is not set');
    }

    this.updateConnectionStatus(ConnectionStatus.Loading);

    this.client = createExplorerClient(url, true);
  }

  public async request<T>(query: TypedDocumentNode<T>, variables: AnyVariables = {}) {
    this.initClient();

    const payload = await this.client.query(query, variables).toPromise();

    this.handlePayloadStatus(payload);

    return payload.data;
  }

  // https://formidable.com/open-source/urql/docs/advanced/subscriptions/#one-off-subscriptions
  public subscribe<T>(subscription: TypedDocumentNode<T>, variables: AnyVariables = {}) {
    this.initClient();

    return (handler: (payload: OperationResult<T, any>) => void) => {
      const { unsubscribe } = pipe(
        this.client.subscription(subscription, variables),
        subscribe((payload) => {
          this.handlePayloadStatus(payload);
          handler(payload);
        })
      );

      return unsubscribe;
    };
  }
}
