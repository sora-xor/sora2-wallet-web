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

  async delete(id: string) {
    await this.auth();
    await this.api.deleteFile(id);
  }

  async update(id: string, name: string) {
    await this.auth();
    await this.api.updateFilename(id, name);
  }
}

export const googleStorage = new GoogleAccountStorage({
  api: new GoogleDriveApi({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] }),
  oauth: new GoogleOauth({ clientId: CLIENT_ID, scope: SCOPE }),
});
