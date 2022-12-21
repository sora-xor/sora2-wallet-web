import { pipe, subscribe } from 'wonka';

import store from '../../../store';

import { AccountModule } from './modules/account';
import { PriceModule } from './modules/price';
import { PoolModule } from './modules/pool';

import { createExplorerClient } from '../client';

import type { Client, OperationResult, ResultOf, TypedDocumentNode, AnyVariables } from '../client';

export default class SubqueryExplorer {
  public client!: Client;

  public readonly account: AccountModule = new AccountModule(this);
  public readonly price: PriceModule = new PriceModule(this);
  public readonly pool: PoolModule = new PoolModule(this);

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

    const { data } = await this.client.query<ResultOf<typeof query>>(query, variables).toPromise();

    return data;
  }

  // https://formidable.com/open-source/urql/docs/advanced/subscriptions/#one-off-subscriptions
  public subscribe<T>(subscription: TypedDocumentNode<T>, variables: AnyVariables = {}) {
    this.initClient();

    return (handler: (payload: OperationResult<T, any>) => void) => {
      const { unsubscribe } = pipe(
        this.client.subscription<ResultOf<typeof subscription>>(subscription, variables),
        subscribe((payload) => handler(payload))
      );

      return unsubscribe;
    };
  }
}
