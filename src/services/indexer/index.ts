import { IndexerType } from '@/consts';

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

export interface SubqueryIndexer {
  type: IndexerType.SUBQUERY;
  services: {
    explorer: typeof SubqueryExplorerService;
    dataParser: typeof SubqueryDataParserService;
  };
  historyElementsFilter: typeof subqueryHistoryElementsFilter;
}

export interface SubsquidIndexer {
  type: IndexerType.SUBSQUID;
  services: {
    explorer: typeof SubsquidExplorerService;
    dataParser: typeof SubsquidDataParserService;
  };
  historyElementsFilter: typeof subsquidHistoryElementsFilter;
}

type IndexerTypeMap = {
  [IndexerType.SUBQUERY]: SubqueryIndexer;
  [IndexerType.SUBSQUID]: SubsquidIndexer;
};

function getIndexer<T extends IndexerType>(type: T): IndexerTypeMap[T] {
  switch (type) {
    case IndexerType.SUBQUERY:
      return {
        type: IndexerType.SUBQUERY,
        services: {
          explorer: SubqueryExplorerService,
          dataParser: SubqueryDataParserService,
        },
        historyElementsFilter: subqueryHistoryElementsFilter,
      } as IndexerTypeMap[T];
    case IndexerType.SUBSQUID:
      return {
        type: IndexerType.SUBSQUID,
        services: {
          explorer: SubsquidExplorerService,
          dataParser: SubsquidDataParserService,
        },
        historyElementsFilter: subsquidHistoryElementsFilter,
      } as IndexerTypeMap[T];
    default:
      throw new Error(`Unsupported indexer type: ${type}`);
  }
}

export function getCurrentIndexer() {
  const indexerType = store.state.wallet.settings.indexerType;
  return getIndexer(indexerType);
}
