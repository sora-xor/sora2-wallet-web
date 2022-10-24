import { Storage } from '@sora-substrate/util';

export const storage = new Storage();

// CHECKME: Uncomment or remove this functionality depending on user's feedback
// to save setting preferences.
// export const settingsStorage = new Storage('dexSettings');
/**
 * This storage will be dependent on runtime version
 */
export const runtimeStorage = new Storage('runtime');
