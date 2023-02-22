import { ScriptLoader } from '../../util/scriptLoader';
import { waitForDocumentReady } from '../../util';

type GoogleApiOptions = {
  apiKey: string;
  discoveryDocs?: string[];
};

export class GoogleApi {
  constructor(options: GoogleApiOptions) {
    this.init(options);
  }

  get hasToken(): boolean {
    return !!gapi.client.getToken();
  }

  private async init(options: GoogleApiOptions): Promise<void> {
    await this.load();
    await this.initClient(options);
  }

  private async load(): Promise<void> {
    await Promise.all([ScriptLoader.load('https://apis.google.com/js/api.js'), waitForDocumentReady()]);
  }

  private async initClient({ apiKey, discoveryDocs }: GoogleApiOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client', () => {
        gapi.client.init({ apiKey, discoveryDocs }).then(resolve).catch(reject);
      });
    });
  }
}
