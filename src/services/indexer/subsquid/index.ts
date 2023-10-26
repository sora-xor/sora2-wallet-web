import { IndexerType } from '@/consts';
import store from '@/store';

import { createExplorerClient } from './client';
import SubsquidExplorer from './explorer';
import SubsquidDataParser from './parser';

export * from './queries/historyElements';

export const SubsquidExplorerService = new SubsquidExplorer({
  type: IndexerType.SUBSQUID,
  createClient: createExplorerClient,
  setStatus: (status) => store.commit.wallet.settings.setIndexerStatus({ indexer: IndexerType.SUBSQUID, status }),
  getStatus: () => store.state.wallet.settings.indexers[IndexerType.SUBSQUID].status,
  getEndpoint: () => store.state.wallet.settings.indexers[IndexerType.SUBSQUID].endpoint,
});
export const SubsquidDataParserService = new SubsquidDataParser();
