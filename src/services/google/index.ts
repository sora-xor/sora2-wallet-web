import { Singleton } from '../../decorators';

import { GoogleDriveApi } from './api';
import { GoogleOauth } from './oauth';

const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

@Singleton
class GoogleDriveStorage {
  protected readonly api!: GoogleDriveApi;
  protected readonly oauth!: GoogleOauth;

  protected readonly appDataFolder = 'appDataFolder';
  protected readonly backupFolderName = 'backupFolder';
  protected backupFolderId!: string;

  constructor({ api, oauth }: { api: GoogleDriveApi; oauth: GoogleOauth }) {
    this.api = api;
    this.oauth = oauth;
  }

  get hasKey(): boolean {
    return this.api.hasKey && this.oauth.hasKey;
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

  async createBackupFolder() {
    if (this.backupFolderId) return;

    let id = await this.api.getFolderId(this.backupFolderName, this.appDataFolder);

    if (!id) {
      id = await this.api.createFolder(this.backupFolderName, this.appDataFolder);

      if (!id) throw new Error(`[${this.constructor.name}]: Unable to create folder`);
    }

    this.backupFolderId = id;
  }

  async get(id: string) {
    await this.auth();
    const file = await this.api.readFile(id);

    return file;
  }

  async getAll() {
    await this.auth();
    await this.createBackupFolder();
    const query = `'${this.backupFolderId}' in parents`;
    const files = await this.api.getFiles(this.appDataFolder, query);

    return files;
  }

  async create({ json, name, description }: { json: string; description: string; name: string }) {
    await this.auth();
    await this.createBackupFolder();
    const metadata = { name, description, parents: [this.backupFolderId] };
    const id = await this.api.createFile(metadata);

    await this.update(id, { json, name, description });
  }

  async update(id: string, { json, name, description }: { json: string; description: string; name: string }) {
    await this.auth();

    const metadata = { name, description };
    const body = this.api.prepareBody(json, metadata);

    await this.api.updateFile(id, body);
  }

  async delete(id: string) {
    await this.auth();
    await this.api.deleteFile(id);
  }
}

export const GDriveStorage = new GoogleDriveStorage({
  api: new GoogleDriveApi(),
  oauth: new GoogleOauth(),
});
