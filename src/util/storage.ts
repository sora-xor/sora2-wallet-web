import { Storage } from '@sora-substrate/util';
import { StorageKey, RuntimeStorageKey } from '../types/common';

export const storage = new Storage<StorageKey>();

/**
 * This storage will be dependent on runtime version
 */
export const runtimeStorage = new Storage<RuntimeStorageKey>('runtime');

// TODO: Combine with dexSettings storage when wallet repo migration
export const settingsStorage = new Storage('dexSettings');
