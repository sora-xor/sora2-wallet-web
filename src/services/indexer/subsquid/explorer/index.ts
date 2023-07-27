import BaseSubsquidExplorer from './base';
import { AccountModule } from './modules/account';
import { PoolModule } from './modules/pool';
import { PriceModule } from './modules/price';

import type { TypedDocumentNode, AnyVariables } from '../client';
import type {
  EntitiesConnectionQueryResponse,
  SubsquidNodesConnectionInfo,
  NodesQueryResponse,
  SubscriptionResponse,
} from '../types';

export default class SubsquidExplorer extends BaseSubsquidExplorer {
  public readonly account: AccountModule = new AccountModule(this);
  public readonly price: PriceModule = new PriceModule(this);
  public readonly pool: PoolModule = new PoolModule(this);

  public async fetchEntities<T>(
    query: TypedDocumentNode<NodesQueryResponse<T>>,
    variables?: AnyVariables
  ): Promise<Nullable<{ nodes: T[]; totalCount: SubsquidNodesConnectionInfo['totalCount'] }>> {
    try {
      const response = await this.request(query, variables);

      if (!response) return null;

      return { nodes: response.nodes, totalCount: response.info.totalCount };
    } catch (error) {
      console.warn('Subsquid is not available or data is incorrect!', error);
      return null;
    }
  }

  public async fetchEntitiesConnection<T>(
    query: TypedDocumentNode<EntitiesConnectionQueryResponse<T>>,
    variables?: AnyVariables
  ): Promise<Nullable<EntitiesConnectionQueryResponse<T>['entities']>> {
    try {
      const response = await this.request(query, variables);

      if (!response || !response.entities) return null;

      return response.entities;
    } catch (error) {
      console.warn('Subsquid is not available or data is incorrect!', error);
      return null;
    }
  }

  public async fetchAllEntitiesConnection<T, R>(
    query: TypedDocumentNode<EntitiesConnectionQueryResponse<T>>,
    variables: AnyVariables = {},
    parse?: (entity: T) => R
  ): Promise<Nullable<R[]>> {
    const acc: any = [];

    let after: string | null = null;
    let hasNextPage = true;

    try {
      do {
        const response = await this.fetchEntitiesConnection(query, { ...variables, after });

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
      console.warn('Subsquid is not available or data is incorrect!', error);
      return null;
    }
  }

  public createEntitySubscription<T, R>(
    subscription: TypedDocumentNode<SubscriptionResponse<T>>,
    variables: AnyVariables = {},
    parse: (entity: T) => R,
    handler: (entity: R) => void,
    errorHandler: () => void
  ): VoidFunction {
    const createSubscription = this.subscribe(subscription, variables);

    return createSubscription((payload) => {
      try {
        if (payload.data) {
          const entities = payload.data.nodes.map((node) => parse(node));
          entities.forEach((entity) => handler(entity));
        } else {
          throw new Error('Subscription payload data is undefined');
        }
      } catch (error) {
        errorHandler();
      }
    });
  }
}
