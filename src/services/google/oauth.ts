import { ScriptLoader } from '../../util/scriptLoader';
import { waitForDocumentReady } from '../../util';

type GoogleOauthOptions = {
  clientId: string;
  scope: string;
};

export class GoogleOauth {
  public readonly options!: GoogleOauthOptions;

  private client!: google.accounts.oauth2.TokenClient;
  private token!: Nullable<google.accounts.oauth2.TokenResponse>;

  private authCallback = (token: google.accounts.oauth2.TokenResponse) => {};
  private authErrorCallback = (error: google.accounts.oauth2.ClientConfigError) => {
    console.error(error);
  };

  private isAuthProcess = false;

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

  private async waitForAuthFinalization(func: FnWithoutArgs): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.authCallback = (token) => {
        const expiresIn = String(Date.now() + +token.expires_in * 1000);
        this.token = { ...token, expires_in: expiresIn };
        this.isAuthProcess = false;
        resolve();
      };
      this.authErrorCallback = (error) => {
        this.token = null;
        this.isAuthProcess = false;
        reject(error);
      };

      this.isAuthProcess = true;
      func();
    });
  }

  public async checkToken(): Promise<void> {
    if (!this.token || Date.now() + 59 * 60 * 1000 > Number(this.token.expires_in)) {
      await this.getToken();
    }
  }

  public async getToken(): Promise<void> {
    if (this.isAuthProcess) return;

    await this.waitForAuthFinalization(() => {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.client.requestAccessToken({ prompt: 'consent' });
    });
  }
}
