import { Storage } from '@sora-substrate/util';

import type { StorageKey, RuntimeStorageKey, SettingsStorageKey } from '../types/common';
/**
 * This storage is dependent on account login
 */
export const storage = new Storage<StorageKey>();

/**
 * This storage is dependent on runtime version
 */
export const runtimeStorage = new Storage<RuntimeStorageKey>('runtime');

/**
 * Common storage
 */
export const settingsStorage = new Storage<SettingsStorageKey>('dexSettings');
