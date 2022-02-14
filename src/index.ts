import debounce from 'lodash/fp/debounce';
import type Vue from 'vue';
import type { Store } from 'vuex';

import installWalletPlugins from './plugins';
// import './styles' We don't need it for now

// Components
import SoraWallet from './SoraWallet.vue';
import WalletAccount from './components/WalletAccount.vue';
import WalletAvatar from './components/WalletAvatar.vue';
import InfoLine from './components/InfoLine.vue';
import FormattedAmount from './components/FormattedAmount.vue';
import FormattedAmountWithFiatValue from './components/FormattedAmountWithFiatValue.vue';
import TransactionHashView from './components/TransactionHashView.vue';
import NetworkFeeWarning from './components/NetworkFeeWarning.vue';
// Mixins
import NetworkFeeWarningMixin from './components/mixins/NetworkFeeWarningMixin';
import NumberFormatterMixin from './components/mixins/NumberFormatterMixin';
import FormattedAmountMixin from './components/mixins/FormattedAmountMixin';
import TransactionMixin from './components/mixins/TransactionMixin';
import TranslationMixin from './components/mixins/TranslationMixin';
import LoadingMixin from './components/mixins/LoadingMixin';
import ReferralRewardsMixin from './components/mixins/ReferralRewardsMixin';

import en from './lang/en';
import internalStore, { modules } from './store'; // `internalStore` is required for local usage
import { storage, runtimeStorage } from './util/storage';
import { api, connection } from './api';
import { delay, getExplorerLinks, groupRewardsByAssetsList } from './util';
import { SubqueryExplorerService } from './services/subquery';
import * as WALLET_CONSTS from './consts';
import * as WALLET_TYPES from './types/common';

let store: Store<unknown>;
let unsubscribeStoreFromStorage: VoidFunction;

const subscribeStoreToStorageUpdates = (store) => {
  if (typeof unsubscribeStoreFromStorage === 'function') {
    unsubscribeStoreFromStorage();
  }

  const syncWithStorageHandler = debounce(100)(() => store.dispatch('syncWithStorage'));

  window.addEventListener('storage', syncWithStorageHandler);

  unsubscribeStoreFromStorage = () => window.removeEventListener('storage', syncWithStorageHandler);
};

const SoraWalletElements = {
  install(vue: typeof Vue, options: any): void {
    if (!options.store) {
      throw new Error('Please provide vuex store.');
    }
    Object.values(WALLET_TYPES.Modules).forEach((module) => {
      options.store.registerModule(module, modules[module]);
    });
    store = options.store;
    installWalletPlugins(vue, store);
    vue.component('SoraWallet', SoraWallet); // Root component
  },
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(SoraWalletElements, {});
}

async function initWallet({
  withoutStore = false,
  whiteListOverApi = false,
  permissions,
}: WALLET_CONSTS.WalletInitOptions = {}): Promise<void> {
  if (!withoutStore && !store) {
    await delay();
    return await initWallet({ withoutStore, whiteListOverApi, permissions });
  } else {
    if (withoutStore) {
      store = internalStore;
    }
    if (connection.loading) {
      await delay();
      return await initWallet({ withoutStore, whiteListOverApi, permissions });
    }
    if (!connection.api) {
      await connection.open();
      console.info('Connected to blockchain', connection.endpoint);
    }
    if (permissions) {
      store.dispatch('setPermissions', permissions);
    }
    try {
      api.initialize();
    } catch (error) {
      console.error('Something went wrong during api initialization', error);
      throw error;
    }
    await store.dispatch('getWhitelist', { whiteListOverApi });
    await store.dispatch('activateNetwokSubscriptions');
    await store.dispatch('activateInternalSubscriptions');
    await store.dispatch('checkSigner');
    await store.dispatch('setWalletLoaded', true);
    subscribeStoreToStorageUpdates(store);
  }
}

const components = {
  SoraWallet,
  WalletAccount,
  WalletAvatar,
  InfoLine,
  FormattedAmount,
  FormattedAmountWithFiatValue,
  TransactionHashView,
  NetworkFeeWarning,
};

const mixins = {
  NetworkFeeWarningMixin,
  NumberFormatterMixin,
  FormattedAmountMixin,
  TransactionMixin,
  TranslationMixin,
  LoadingMixin,
  ReferralRewardsMixin,
};

export {
  initWallet,
  en,
  api,
  connection,
  storage,
  runtimeStorage,
  getExplorerLinks,
  groupRewardsByAssetsList,
  WALLET_CONSTS,
  WALLET_TYPES,
  components,
  mixins,
  SubqueryExplorerService,
};
export default SoraWalletElements;
