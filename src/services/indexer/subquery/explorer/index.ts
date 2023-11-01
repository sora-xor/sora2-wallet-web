import BaseSubqueryExplorer from './base';
import { SubqueryAccountModule } from './modules/account';
import { SubqueryPoolModule } from './modules/pool';
import { SubqueryPriceModule } from './modules/price';

import type { TypedDocumentNode, AnyVariables } from '../client';
import type { SubqueryConnectionQueryResponse, SubquerySubscriptionPayload } from '../types';

export default class SubqueryExplorer extends BaseSubqueryExplorer {
  public readonly account: SubqueryAccountModule = new SubqueryAccountModule(this);
  public readonly price: SubqueryPriceModule = new SubqueryPriceModule(this);
  public readonly pool: SubqueryPoolModule = new SubqueryPoolModule(this);

  public async fetchEntities<T>(
    query: TypedDocumentNode<SubqueryConnectionQueryResponse<T>>,
    variables?: AnyVariables
  ): Promise<Nullable<SubqueryConnectionQueryResponse<T>['data']>> {
    try {
      const response = await this.request(query, variables);

      if (!response || !response.data) return null;

      return response.data;
    } catch (error) {
      console.warn('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  public async fetchAllEntities<T, R>(
    query: TypedDocumentNode<SubqueryConnectionQueryResponse<T>>,
    variables: AnyVariables = {},
    parse?: (entity: T) => R
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

        response.edges.forEach((el) => {
          const record = parse ? parse(el.node) : el.node;

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
    subscription: TypedDocumentNode<SubquerySubscriptionPayload<T>>,
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
          throw new Error('Subscription payload data is undefined');
        }
      } catch (error) {
        errorHandler();
      }
    });
  }
}