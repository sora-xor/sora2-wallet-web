// import { axiosInstance as axios } from '@sora-substrate/util';

// import type { KeyringPair$Json } from '@polkadot/keyring/types';
// import type { FilesResponse, ICreateFile, IGetFilesResponse, VerifyTokenResponse } from './types';

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
