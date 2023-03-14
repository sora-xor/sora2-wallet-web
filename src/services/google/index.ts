import { GoogleDriveApi } from './api';
import { GoogleOauth } from './oauth';

const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

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
  api: new GoogleDriveApi(process.env.GOOGLE_API_KEY as string),
  oauth: new GoogleOauth({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    scope: DRIVE_APPDATA_SCOPE,
  }),
});
