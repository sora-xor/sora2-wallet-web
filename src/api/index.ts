import { api, connection } from '@sora-substrate/util';

import { storage } from '../util/storage';

api.setStorage(storage);

export { connection, api };
