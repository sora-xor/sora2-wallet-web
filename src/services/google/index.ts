import { GoogleDriveApi } from './api';
import { GoogleOauth } from './oauth';

const CLIENT_ID = '498393666682-9eeiioee0a2sgb1671e9qir645f9n6cv.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAzj7JxB-j8pJixtt6JSqLPhG0y02CGYOU';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

class GoogleAccountStorage {
  protected readonly api!: GoogleDriveApi;
  protected readonly oauth!: GoogleOauth;

  constructor({ api, oauth }: { api: GoogleDriveApi; oauth: GoogleOauth }) {
    this.api = api;
    this.oauth = oauth;
  }

  async init(): Promise<void> {
    await Promise.all([this.api, this.oauth].map((client) => client.init()));
  }

  async auth(): Promise<void> {
    await this.init();
    await this.oauth.checkToken();
  }

  async get(id: string) {
    await this.auth();
    const response = await this.api.getFile(id);

    return response.result;
  }

  async getAll() {
    await this.auth();
    const response = await this.api.getFiles();

    return response.result.files;
  }

  async create(json: string, address: string, name: string) {
    await this.auth();
    await this.api.createFile(json, { name, address });
  }
}

export const googleStorage = new GoogleAccountStorage({
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
