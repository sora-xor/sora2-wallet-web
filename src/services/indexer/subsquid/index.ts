import SubsquidExplorer from './explorer';
import SubsquidDataParser from './parser';

export * from './queries/historyElements';

export const SubsquidExplorerService = new SubsquidExplorer();
export const SubsquidDataParserService = new SubsquidDataParser();
