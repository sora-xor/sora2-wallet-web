import { openDB, DBSchema } from 'idb';

interface MetadataDB extends DBSchema {
  metadata: {
    value: {
      genesisHash: string;
      specVersion: number;
      metadata: string;
    };
    key: string;
  };
}

const METADATA_DB_NAME = 'metadata';
const METADATA_DB_VERSION = 1;
const METADATA_DB_CONNECTION = openDB<MetadataDB>(METADATA_DB_NAME, METADATA_DB_VERSION, {
  upgrade(db) {
    db.createObjectStore('metadata', {
      keyPath: 'genesisHash',
    });
  },
});

export async function getMetadataStore() {
  if (!('indexedDB' in window)) {
    return {
      get: undefined,
      set: undefined,
    };
  }

  const db = await METADATA_DB_CONNECTION;

  const get = async (genesisHash: string, specVersion: number): Promise<string | null> => {
    const time1 = performance.now();
    const record = await db.get('metadata', genesisHash);

    if (record) {
      if (record.specVersion === specVersion) {
        console.log('get', performance.now() - time1);
        return record.metadata;
      } else {
        await db.delete('metadata', genesisHash);
      }
    }

    console.log('get', performance.now() - time1);

    return null;
  };

  const set = async (genesisHash: string, specVersion: number, metadata: string) => {
    const time1 = performance.now();
    await db.put('metadata', { genesisHash, specVersion, metadata });
    console.log('set', performance.now() - time1);
  };

  return { get, set };
}
