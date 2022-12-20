import { FPNumber } from '@sora-substrate/math';

import type SubqueryExplorer from '../index';
import type { EntitiesQueryResponse } from '../../types';
import type { TypedDocumentNode, AnyVariables } from '../../client';

export class BaseModule {
  protected readonly root!: SubqueryExplorer;

  constructor(root: SubqueryExplorer) {
    this.root = root;
  }

  public async fetchEntities<T>(
    query: TypedDocumentNode<EntitiesQueryResponse<T>>,
    variables?: AnyVariables
  ): Promise<Nullable<EntitiesQueryResponse<T>['entities']>> {
    try {
      const response = await this.root.request(query, variables);

      if (!response || !response.entities) return null;

      const { pageInfo, nodes } = response.entities;

      return { pageInfo, nodes };
    } catch (error) {
      console.warn('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  public async fetchAndParseEntities<T, R>(
    query: TypedDocumentNode<EntitiesQueryResponse<T>>,
    parse: (entity: T) => R
  ): Promise<Nullable<R>> {
    let acc: any = {};
    let after = '';
    let hasNextPage = true;

    try {
      do {
        const response = await this.fetchEntities(query, { after });

        if (!response) {
          return Object.keys(acc).length ? acc : null;
        }

        after = response.pageInfo.endCursor;
        hasNextPage = response.pageInfo.hasNextPage;

        response.nodes.forEach((el) => {
          console.log(el);
          const record = parse(el);

          acc = { ...acc, ...record };
        });
      } while (hasNextPage);

      return acc;
    } catch (error) {
      console.warn('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  public formatStringNumber(value: Nullable<string>): FPNumber {
    return value ? new FPNumber(value) : FPNumber.ZERO;
  }
}
