import { defineModule } from 'direct-vuex';

import router from './router';
import subscriptions from './subscriptions';
import settings from './settings';
import transactions from './transactions';
import account from './account';

const wallet = defineModule({
  namespaced: true,
  modules: {
    account,
    router,
    settings,
    subscriptions,
    transactions,
  },
});

export default wallet;
