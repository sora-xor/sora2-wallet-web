// import { axiosInstance as axios } from '@sora-substrate/util';

// import type { KeyringPair$Json } from '@polkadot/keyring/types';
// import type { FilesResponse, ICreateFile, IGetFilesResponse, VerifyTokenResponse } from './types';

import { GoogleApi } from './api';
import { GoogleOauth } from './oauth';

const CLIENT_ID = '498393666682-9eeiioee0a2sgb1671e9qir645f9n6cv.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAzj7JxB-j8pJixtt6JSqLPhG0y02CGYOU';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

class GoogleDriveApi extends GoogleApi {
  private prepareData(
    json: string,
    { name, address, boundary = 'foo_bar_baz' }: { name: string; address: string; boundary: string }
  ) {
    const metadata = {
      name,
      mimeType: 'application/json',
      description: address,
      parents: ['appDataFolder'],
    };

    return `
--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify(metadata)}
--${boundary}
Content-Type: application/json

${json}
--${boundary}--`;
  }

  public async getFiles() {
    const response = await gapi.client.drive.files.list({
      fields: 'files(id,name,description)',
      spaces: 'appDataFolder',
    });

    return response;
  }

  public async getFile(id: string) {
    const response = await gapi.client.drive.files.get({
      fileId: id,
      alt: 'media',
    });

    return response;
  }

  public async createFile(json: string, { name, address }: { name: string; address: string }) {
    const boundary = 'foo_bar_baz';
    const body = this.prepareData(json, { name, address, boundary });
    const length = body.length;
    const request = gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': length.toString(),
      },
      body,
    });

    await new Promise((resolve, reject) => {
      try {
        request.execute(resolve);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }
}

class GoogleManage {
  public readonly api!: GoogleDriveApi;
  public readonly oauth!: GoogleOauth;

  constructor({ api, oauth }: { api: GoogleDriveApi; oauth: GoogleOauth }) {
    this.api = api;
    this.oauth = oauth;
  }

  async init(): Promise<void> {
    await Promise.all([this.api, this.oauth].map((client) => client.init()));
  }

  async auth(): Promise<void> {
    await this.init();

    if (!this.api.hasToken) {
      await this.oauth.getToken();
    }
  }
}

export const googleManage = new GoogleManage({
  api: new GoogleDriveApi({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }),
  oauth: new GoogleOauth({ clientId: CLIENT_ID, scope: SCOPE }),
});

// class GoogleManageOld {
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

// public async getFiles(token?: string): Promise<IGetFilesResponse> {
//   const { data } = await axios.get<IGetFilesResponse>(
//     `${this.baseURL}/files?fields=files(id,name,description)&spaces=appDataFolder`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         ...this.config.headers,
//       },
//     }
//   );

//   return data;
// }

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
