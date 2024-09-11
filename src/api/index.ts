import { api, connection } from '@sora-substrate/sdk';

import { storage } from '../util/storage';

api.setStorage(storage);
api.shouldPairBeLocked = true;

export { connection, api };
