import { ScriptLoader } from '../../util/scriptLoader';
import { waitForDocumentReady } from '../../util';

type GoogleOauthOptions = {
  clientId: string;
  scope: string;
};

export class GoogleOauth {
  public readonly options!: GoogleOauthOptions;
  public client!: google.accounts.oauth2.TokenClient;

  private authCallback = (token?: google.accounts.oauth2.TokenResponse) => {};
  private authErrorCallback = (error?: google.accounts.oauth2.ClientConfigError) => {
    console.error(error);
  };

  constructor(options: GoogleOauthOptions) {
    this.options = options;
  }

  get ready(): boolean {
    return !!this.client;
  }

  public async init(): Promise<void> {
    if (this.ready) return;

    await this.load();
    this.initClient(this.options);
  }

  private async load(): Promise<void> {
    await Promise.all([ScriptLoader.load('https://accounts.google.com/gsi/client'), waitForDocumentReady()]);
  }

  private initClient({ clientId, scope }: GoogleOauthOptions): void {
    this.client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: (token) => this.authCallback(token),
      error_callback: (error) => this.authErrorCallback(error),
    });
  }

  private async waitForAuthFinalization(func: AsyncFnWithoutArgs | FnWithoutArgs): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.authCallback = () => {
        resolve();
      };
      this.authErrorCallback = (error) => {
        reject(error);
      };

      func();
    });
  }

  public async getToken(): Promise<void> {
    await this.waitForAuthFinalization(() => {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.client.requestAccessToken({ prompt: 'consent' });
    });
  }
}
