import { IndexerType } from '@/consts';

import store from '../../store';

import IndexerDataParser from './parser';
import { SubqueryExplorerService, historyElementsFilter as subqueryHistoryElementsFilter } from './subquery';
import { SubsquidExplorerService, historyElementsFilter as subsquidHistoryElementsFilter } from './subsquid';

export interface SubqueryIndexer {
  type: IndexerType.SUBQUERY;
  services: {
    explorer: typeof SubqueryExplorerService;
    dataParser: IndexerDataParser;
  };
  historyElementsFilter: typeof subqueryHistoryElementsFilter;
}

export interface SubsquidIndexer {
  type: IndexerType.SUBSQUID;
  services: {
    explorer: typeof SubsquidExplorerService;
    dataParser: IndexerDataParser;
  };
  historyElementsFilter: typeof subsquidHistoryElementsFilter;
}

type IndexerTypeMap = {
  [IndexerType.SUBQUERY]: SubqueryIndexer;
  [IndexerType.SUBSQUID]: SubsquidIndexer;
};

const IndexerDataParserService = new IndexerDataParser();

function getIndexer<T extends IndexerType>(type: T): IndexerTypeMap[T] {
  switch (type) {
    case IndexerType.SUBQUERY:
      return {
        type: IndexerType.SUBQUERY,
        services: {
          explorer: SubqueryExplorerService,
          dataParser: IndexerDataParserService,
        },
        historyElementsFilter: subqueryHistoryElementsFilter,
      } as IndexerTypeMap[T];
    case IndexerType.SUBSQUID:
      return {
        type: IndexerType.SUBSQUID,
        services: {
          explorer: SubsquidExplorerService,
          dataParser: IndexerDataParserService,
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
