import { IndexerType } from '@/consts';
import store from '@/store';

import { createExplorerClient } from './client';
import SubqueryExplorer from './explorer';

export * from './queries/historyElements';

export const SubqueryExplorerService = new SubqueryExplorer({
  type: IndexerType.SUBQUERY,
  createExplorerClient,
  setStatus: (status) => store.dispatch.wallet.settings.setIndexerStatus({ indexer: IndexerType.SUBQUERY, status }),
  getStatus: () => store.state.wallet.settings.indexers[IndexerType.SUBQUERY].status,
  getEndpoint: () => store.state.wallet.settings.indexers[IndexerType.SUBQUERY].endpoint,
});
