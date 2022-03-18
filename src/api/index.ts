import { api, connection } from '@sora-substrate/util';

import { storage } from '../util/storage';

api.setStorage(storage);

(window as any).connection = connection;

export { connection, api };
