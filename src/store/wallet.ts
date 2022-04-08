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

export enum WalletModule {
  Account = 'account',
  Router = 'router',
  Settings = 'settings',
  Subscriptions = 'subscriptions',
  Transactions = 'transactions',
}

export const WalletModules = Object.values(WalletModule).map((submodule) => `wallet/${submodule}`);

export default wallet;
