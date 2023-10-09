import SubqueryExplorer from './explorer';
import SubqueryDataParser from './parser';

export * from './queries/historyElements';

export const SubqueryExplorerService = new SubqueryExplorer();
export const SubqueryDataParserService = new SubqueryDataParser();
