import { pipe, subscribe } from 'wonka';

import store from '../../../store';

import { createExplorerClient } from '../client';

import type { Client, OperationResult, TypedDocumentNode, AnyVariables } from '../client';

export default class BaseSubqueryExplorer {
  public client!: Client;

  public initClient() {
    if (this.client) return;

    const url = store.state.wallet.settings.subqueryEndpoint;

    if (!url) {
      throw new Error('Subquery endpoint is not set');
    }

    this.client = createExplorerClient(url, true);
  }

  public async request<T>(query: TypedDocumentNode<T>, variables: AnyVariables = {}) {
    this.initClient();

    const { data } = await this.client.query(query, variables).toPromise();

    return data;
  }

  // https://formidable.com/open-source/urql/docs/advanced/subscriptions/#one-off-subscriptions
  public subscribe<T>(subscription: TypedDocumentNode<T>, variables: AnyVariables = {}) {
    this.initClient();

    return (handler: (payload: OperationResult<T, any>) => void) => {
      const { unsubscribe } = pipe(
        this.client.subscription(subscription, variables),
        subscribe((payload) => handler(payload))
      );

      return unsubscribe;
    };
  }
}
