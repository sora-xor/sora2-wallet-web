import { IndexerType } from '@/consts';
import store from '@/store';

import { createExplorerClient } from '../client';

import SubsquidExplorer from './explorer';

export * from './queries/historyElements';

export const SubsquidExplorerService = new SubsquidExplorer({
  type: IndexerType.SUBSQUID,
  createExplorerClient,
  setStatus: (status) => store.dispatch.wallet.settings.setIndexerStatus({ indexer: IndexerType.SUBSQUID, status }),
  getStatus: () => store.state.wallet.settings.indexers[IndexerType.SUBSQUID].status,
  getEndpoint: () => store.state.wallet.settings.indexers[IndexerType.SUBSQUID].endpoint,
});
