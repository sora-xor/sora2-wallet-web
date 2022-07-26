import { Storage } from '@sora-substrate/util';

export const storage = new Storage();

// export const settingsStorage = new Storage('dexSettings');
/**
 * This storage will be dependent on runtime version
 */
export const runtimeStorage = new Storage('runtime');
