import { Singleton } from '../../decorators';

import { GoogleDriveApi } from './api';
import { GoogleOauth } from './oauth';

const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

@Singleton
class GoogleAccountStorage {
  protected readonly api!: GoogleDriveApi;
  protected readonly oauth!: GoogleOauth;

  constructor({ api, oauth }: { api: GoogleDriveApi; oauth: GoogleOauth }) {
    this.api = api;
    this.oauth = oauth;
  }

  setOptions(apiKey: string, clientId: string) {
    this.api.setOptions({ apiKey, discoveryDocs: [DRIVE_DISCOVERY_DOC] });
    this.oauth.setOptions({ clientId, scope: DRIVE_APPDATA_SCOPE });
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

  async create(data: { json: string; address: string; name: string }, id?: string) {
    await this.auth();
    await this.api.createFile(data, id);
  }

  async delete(id: string) {
    await this.auth();
    await this.api.deleteFile(id);
  }
}

export const GDriveStorage = new GoogleAccountStorage({
  api: new GoogleDriveApi(),
  oauth: new GoogleOauth(),
});
