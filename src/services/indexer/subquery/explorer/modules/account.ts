import { HistoryElementsQuery } from '../../queries/historyElements';
import { AccountHistorySubscription } from '../../subscriptions/account';

import { SubqueryBaseModule } from './_base';

import type {
  ConnectionQueryResponseData,
  HistoryElement,
  QueryResponseNodes,
  SubqueryHistoryElement,
} from '../../types';

export class SubqueryAccountModule extends SubqueryBaseModule {
  public async getHistory(variables = {}): Promise<Nullable<QueryResponseNodes<HistoryElement>>> {
    const data = await this.getHistoryPaged(variables);
    if (data) {
      return {
        nodes: data.edges.map((edge) => edge.node),
        totalCount: data.totalCount,
      };
    }
    return data;
  }

  public async getHistoryPaged(variables = {}): Promise<Nullable<ConnectionQueryResponseData<HistoryElement>>> {
    return await this.root.fetchEntities(HistoryElementsQuery, variables);
  }

  public createHistorySubscription(accountAddress: string, handler: (entity: SubqueryHistoryElement) => void) {
    const variables = { id: [accountAddress] };
    const createSubscription = this.root.subscribe(AccountHistorySubscription, variables);

    return createSubscription(async (payload) => {
      if (payload.data) {
        const txId = payload.data.payload._entity.latest_history_element_id;
        const variables = { filter: { id: { equalTo: txId } } };
        const response = await this.getHistory(variables);

        if (response && Array.isArray(response.nodes) && response.nodes[0]) {
          handler(response.nodes[0]);
        }
      }
    });
  }
}
