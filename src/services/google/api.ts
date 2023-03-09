import { ScriptLoader } from '../../util/scriptLoader';
import { waitForDocumentReady } from '../../util';

type GoogleApiOptions = {
  apiKey: string;
  discoveryDocs?: string[];
};

export class GoogleApi {
  public readonly options!: GoogleApiOptions;
  private _ready = false;

  constructor(options: GoogleApiOptions) {
    this.options = options;
  }

  get ready(): boolean {
    return this._ready;
  }

  public async init(): Promise<void> {
    if (this.ready) return;

    await this.load();
    await this.initClient(this.options);
  }

  private async load(): Promise<void> {
    await Promise.all([ScriptLoader.load('https://apis.google.com/js/api.js'), waitForDocumentReady()]);
  }

  private async initClient({ apiKey, discoveryDocs }: GoogleApiOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client', () => {
        gapi.client
          .init({ apiKey, discoveryDocs })
          .then(() => {
            this._ready = true;
            resolve();
          })
          .catch(reject);
      });
    });
  }
}
