import { pipe, subscribe } from 'wonka';

import { IndexerType } from '@/consts';
import { ConnectionStatus } from '@/types/common';

import type { Client, OperationResult, TypedDocumentNode, AnyVariables } from '@urql/core';

export type CreateClientFn = (url: string, subscription: boolean) => Client;
export type GetStatusFn = () => ConnectionStatus;
export type SetStatusFn = (status: ConnectionStatus) => void;
export type GetEndpointFn = () => Nullable<string>;

export default class BaseExplorer {
  public client!: Client;
  public type!: IndexerType;

  protected createClient!: CreateClientFn;
  protected getStatus!: GetStatusFn;
  protected setStatus!: SetStatusFn;
  protected getEndpoint!: GetEndpointFn;

  constructor({
    type,
    createClient,
    getStatus,
    setStatus,
    getEndpoint,
  }: {
    type: IndexerType;
    createClient: CreateClientFn;
    getStatus: GetStatusFn;
    setStatus: SetStatusFn;
    getEndpoint: GetEndpointFn;
  }) {
    this.type = type;
    this.createClient = createClient;
    this.getStatus = getStatus;
    this.setStatus = setStatus;
    this.getEndpoint = getEndpoint;
  }

  private handlePayloadStatus<T>(payload: OperationResult<T, any>) {
    const status = payload.error || !payload.data ? ConnectionStatus.Unavailable : ConnectionStatus.Available;
    this.updateConnectionStatus(status);
  }

  private updateConnectionStatus(status: ConnectionStatus) {
    if (this.getStatus() !== status) {
      this.setStatus(status);
    }
  }

  public initClient() {
    if (this.client) return;
    try {
      const url = this.getEndpoint();
      if (!url) {
        throw new Error(`${this.type} endpoint is not set`);
      }
      this.updateConnectionStatus(ConnectionStatus.Loading);
      this.client = this.createClient(url, true);
    } catch {
      this.updateConnectionStatus(ConnectionStatus.Unavailable);
    }
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
