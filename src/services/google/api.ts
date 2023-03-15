import { ScriptLoader } from '../../util/scriptLoader';
import { waitForDocumentReady } from '../../util';

type GoogleApiOptions = {
  apiKey: string;
  discoveryDocs?: string[];
};

export class GoogleApi {
  private options!: GoogleApiOptions;
  private _ready = false;

  get ready(): boolean {
    return this._ready;
  }

  public setOptions(options: GoogleApiOptions): void {
    this.options = { ...options };
  }

  public async init(): Promise<void> {
    if (this.ready) return;
    if (!this.options) throw new Error(`[${this.constructor.name}]: Options should be set before inintialization`);

    await this.load();
    await this.initClient(this.options);
  }

  private async load(): Promise<void> {
    await Promise.all([ScriptLoader.load('https://apis.google.com/js/api.js'), waitForDocumentReady()]);
  }

  private async initClient({ apiKey, discoveryDocs }: GoogleApiOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client', () => {
        gapi.client
          .init({ apiKey, discoveryDocs })
          .then(() => {
            this._ready = true;
            resolve();
          })
          .catch(reject);
      });
    });
  }
}

export class GoogleDriveApi extends GoogleApi {
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
    return await gapi.client.drive.files.list({
      fields: 'files(id,name,description)',
      spaces: 'appDataFolder',
    });
  }

  public async getFile(id: string) {
    return await gapi.client.drive.files.get({
      fileId: id,
      alt: 'media',
    });
  }

  public async updateFilename(id: string, name: string) {
    await gapi.client.drive.files.update({
      fileId: id,
      resource: {
        name,
      },
    });
  }

  public async deleteFile(id: string) {
    await gapi.client.drive.files.delete({
      fileId: id,
    });
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
