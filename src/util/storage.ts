import { Storage } from '@sora-substrate/util';

export const storage = new Storage();

/**
 * This storage will be dependent on runtime version
 */
export const runtimeStorage = new Storage('runtime');
