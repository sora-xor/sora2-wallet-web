import BaseSubqueryExplorer from './base';

import { AccountModule } from './modules/account';
import { PriceModule } from './modules/price';
import { PoolModule } from './modules/pool';

import type { TypedDocumentNode, AnyVariables } from '../client';
import type { EntitiesQueryResponse, SubscriptionPayload } from '../types';

export default class SubqueryExplorer extends BaseSubqueryExplorer {
  public readonly account: AccountModule = new AccountModule(this);
  public readonly price: PriceModule = new PriceModule(this);
  public readonly pool: PoolModule = new PoolModule(this);

  public async fetchEntities<T>(
    query: TypedDocumentNode<EntitiesQueryResponse<T>>,
    variables?: AnyVariables
  ): Promise<Nullable<EntitiesQueryResponse<T>['entities']>> {
    try {
      const response = await this.request(query, variables);

      if (!response || !response.entities) return null;

      const { pageInfo, nodes } = response.entities;

      return { pageInfo, nodes };
    } catch (error) {
      console.warn('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  public async fetchAndParseEntities<T, R>(
    parse: (entity: T) => R,
    query: TypedDocumentNode<EntitiesQueryResponse<T>>,
    variables: AnyVariables = {}
  ): Promise<Nullable<R[]>> {
    const acc: any = [];
    let after = '';
    let hasNextPage = true;

    try {
      do {
        const response = await this.fetchEntities(query, { ...variables, after });

        if (!response) {
          return null;
        }

        after = response.pageInfo.endCursor;
        hasNextPage = response.pageInfo.hasNextPage;

        response.nodes.forEach((el) => {
          const record = parse(el);

          acc.push(record);
        });
      } while (hasNextPage);

      return acc;
    } catch (error) {
      console.warn('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  public createEntitySubscription<T, R>(
    subscription: TypedDocumentNode<SubscriptionPayload<T>>,
    variables: AnyVariables = {},
    parse: (entity: T) => R,
    handler: (entity: R) => void,
    errorHandler: () => void
  ): VoidFunction {
    const createSubscription = this.subscribe(subscription, variables);

    return createSubscription((payload) => {
      try {
        if (payload.data) {
          const entity = parse(payload.data.payload._entity);
          handler(entity);
        } else {
          errorHandler();
        }
      } catch (error) {
        errorHandler();
      }
    });
  }
}
