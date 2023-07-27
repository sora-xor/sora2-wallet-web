import IndexerType from '@/types/indexer';
import store from '../../store';

import {
  SubqueryExplorerService,
  SubqueryDataParserService,
  historyElementsFilter as subqueryHistoryElementsFilter,
} from './subquery';
import {
  SubsquidExplorerService,
  SubsquidDataParserService,
  historyElementsFilter as subsquidHistoryElementsFilter,
} from './subsquid';

export const Indexer = {
  get ExplorerService() {
    return store.state.wallet.settings.indexerType === IndexerType.SUBQUERY
      ? SubqueryExplorerService
      : SubsquidExplorerService;
  },
  get DataParserService() {
    return store.state.wallet.settings.indexerType === IndexerType.SUBQUERY
      ? SubqueryDataParserService
      : SubsquidDataParserService;
  },
  get historyElementsFilter() {
    return store.state.wallet.settings.indexerType === IndexerType.SUBQUERY
      ? subqueryHistoryElementsFilter
      : subsquidHistoryElementsFilter;
  },
};
