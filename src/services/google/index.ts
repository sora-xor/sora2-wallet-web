// import { axiosInstance as axios } from '@sora-substrate/util';

// import type { KeyringPair$Json } from '@polkadot/keyring/types';
// import type { FilesResponse, ICreateFile, IGetFilesResponse, VerifyTokenResponse } from './types';

import { ScriptLoader } from '../../util/scriptLoader';
import { waitForDocumentReady } from '../../util';

const CLIENT_ID = '498393666682-9eeiioee0a2sgb1671e9qir645f9n6cv.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAzj7JxB-j8pJixtt6JSqLPhG0y02CGYOU';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

type GoogleApiOptions = {
  apiKey: string;
  discoveryDocs?: string[];
};

class GoogleApi {
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

  public async getFiles() {
    const response = await gapi.client.drive.files.list({
      fields: 'files(id,name,description)',
      spaces: 'appDataFolder',
    });
  }
}

type GoogleOauthOptions = {
  clientId: string;
  scope: string;
};

class GoogleOauth {
  public tokenClient!: google.accounts.oauth2.TokenClient;

  private authCallback = (token?: google.accounts.oauth2.TokenResponse) => {};
  private authErrorCallback = (error?: google.accounts.oauth2.ClientConfigError) => {
    console.error(error);
  };

  constructor(options: GoogleOauthOptions) {
    this.init(options);
  }

  private async init(options: GoogleOauthOptions): Promise<void> {
    await this.load();
    this.initClient(options);
  }

  private async load(): Promise<void> {
    await Promise.all([ScriptLoader.load('https://accounts.google.com/gsi/client'), waitForDocumentReady()]);
  }

  private initClient({ clientId, scope }: GoogleOauthOptions): void {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
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

  async getToken(): Promise<void> {
    await this.waitForAuthFinalization(() => {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }
}

class GoogleManage {
  public readonly api!: GoogleApi;
  public readonly oauth!: GoogleOauth;

  constructor() {
    this.api = new GoogleApi({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] });
    this.oauth = new GoogleOauth({ clientId: CLIENT_ID, scope: SCOPE });
  }

  async auth(): Promise<void> {
    if (!this.api.hasToken) {
      await this.oauth.getToken();
    }
  }
}

export const googleManage = new GoogleManage();

// class GoogleManage {
//   private readonly baseURL = 'https://www.googleapis.com/drive/v3';
//   private readonly baseUploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
//   // private readonly extensionRedirectURL = chrome.identity.getRedirectURL('welcome');
//   private readonly baseAuthParams = {
//     client_id: process.env.OAUTH_CLIENT_ID as string,
//     response_type: 'token',
//     state: 'pass-through value',
//     access_type: 'online',
//     prompt: 'consent',
//     scope: 'https://www.googleapis.com/auth/drive.appdata',
//   };

//   urlTypes = {
//     main: 'google',
//     export: 'main/wallet',
//   };

//   public get config() {
//     return {
//       params: {
//         fields: 'files(id,name,description)',
//         spaces: 'appDataFolder',
//       },
//       headers: {
//         'Content-type': 'application/json',
//         Accept: 'application/json',
//       },
//     };
//   }

//   private authURL() {
//     const prepUrl = new URL(`https://accounts.google.com/o/oauth2/v2/auth`);
//     const params: Record<string, string> = {
//       ...this.baseAuthParams,
//       redirect_uri: `http://localhost:8080`,
//     };

//     Object.keys(params).forEach((key) => {
//       prepUrl.searchParams.set(key, params[key]);
//     });

//     return prepUrl.href;
//   }

//   private prepareData(json: string, { name, address }: { name: string; address: string }) {
//     return `--foo_bar_baz
// Content-Type: application/json; charset=UTF-8
// {
// name: "${name}.json",
// mimeType: "application/json",
// description: "${address}",
// parents: ["appDataFolder"]
// }
// --foo_bar_baz
// Content-Type: application/json
// ${json}
// --foo_bar_baz--`;
//   }

//   // public async authExtension(type: 'main' | 'export' = 'main', wallet?: string) {
//   //   chrome.identity.launchWebAuthFlow(
//   //     {
//   //       url: this.authURL('extension'),
//   //       interactive: true,
//   //     },
//   //     async (redirect_url) => {
//   //       const searchParams = new URLSearchParams(redirect_url);
//   //       const token = searchParams.get('access_token') || searchParams.get(`${this.extensionRedirectURL}#access_token`);
//   //       const baseURL = `${chrome.runtime.getURL('popup.html')}#/${this.urlTypes[type]}/${token}`;
//   //       const url = type === 'export' && wallet ? `${baseURL}?wallet=${wallet}` : baseURL;

//   //       chrome.tabs.query({ title: 'fearless-wallet' }, ([tab]) => {
//   //         tab && tab.id ? chrome.tabs.update(tab.id, { active: true, url }) : chrome.tabs.create({ active: true, url });
//   //       });
//   //     }
//   //   );
//   // }

//   // public authDesktop() {
//   //   window.open(this.authURL('desktop'));
//   // }

//   public async getFiles(token?: string): Promise<IGetFilesResponse> {
//     const { data } = await axios.get<IGetFilesResponse>(
//       `${this.baseURL}/files?fields=files(id,name,description)&spaces=appDataFolder`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           ...this.config.headers,
//         },
//       }
//     );

//     return data;
//   }

//   public async getFile(id: string, token?: string | undefined): Promise<KeyringPair$Json> {
//     const { data } = await axios.get<KeyringPair$Json>(`${this.baseURL}/files/${id}?alt=media`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         ...this.config.headers,
//       },
//     });

//     return data;
//   }

//   public async verifyToken(token: string): Promise<VerifyTokenResponse> {
//     const { data } = await axios.get<VerifyTokenResponse>(
//       `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
//     );

//     return data;
//   }

//   async createFile({ json, options, token }: ICreateFile): Promise<FilesResponse> {
//     const prepData = this.prepareData(json, options);
//     const length = prepData.length;

//     const { data } = await axios.post<FilesResponse>(this.baseUploadUrl, prepData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'multipart/related; boundary=foo_bar_baz',
//         'Content-Length': length.toString(),
//       },
//     });

//     return data;
//   }

//   async deleteFile(id: string, token: string) {
//     axios.delete(this.baseURL, {
//       params: {
//         fields: id,
//       },
//       headers: {
//         Authorization: `Bearer ${token}`,
//         ...this.config.headers,
//       },
//     });
//   }
// }

// export const googleManage = new GoogleManage();
