import { Storage } from '@sora-substrate/util';
import env from '../../public/env.json';

export const nftStorageApiKey = env.API_KEYS.nftStorage;

export const storage = new Storage();

/**
 * This storage will be dependent on runtime version
 */
export const runtimeStorage = new Storage('runtime');
