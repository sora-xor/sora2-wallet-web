import type SubqueryExplorer from '../index';

export class BaseModule {
  protected readonly root!: SubqueryExplorer;

  constructor(root: SubqueryExplorer) {
    this.root = root;
  }
}
