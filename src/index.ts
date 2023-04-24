import type Vue from 'vue';
import type { PluginObject } from 'vue';

import installWalletPlugins from './plugins';

// Components
import SoraWallet from './SoraWallet.vue';
import WalletAccount from './components/Account/WalletAccount.vue';
import WalletAvatar from './components/WalletAvatar.vue';
import WalletBase from './components/WalletBase.vue';
import AccountCard from './components/Account/AccountCard.vue';
import AssetList from './components/AssetList.vue';
import AssetListItem from './components/AssetListItem.vue';
import AddAssetDetailsCard from './components/AddAsset/AddAssetDetailsCard.vue';
import TokenAddress from './components/TokenAddress.vue';
import SearchInput from './components/SearchInput.vue';
import InfoLine from './components/InfoLine.vue';
import FormattedAmount from './components/FormattedAmount.vue';
import FormattedAmountWithFiatValue from './components/FormattedAmountWithFiatValue.vue';
import TransactionHashView from './components/TransactionHashView.vue';
import NetworkFeeWarning from './components/NetworkFeeWarning.vue';
import TokenLogo from './components/TokenLogo.vue';
import HistoryPagination from './components/HistoryPagination.vue';
import DialogBase from './components/DialogBase.vue';
import NotificationEnablingPage from './components/NotificationEnablingPage.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import SimpleNotification from './components/SimpleNotification.vue';
// Mixins
import NetworkFeeWarningMixin from './components/mixins/NetworkFeeWarningMixin';
import NumberFormatterMixin from './components/mixins/NumberFormatterMixin';
import FormattedAmountMixin from './components/mixins/FormattedAmountMixin';
import TransactionMixin from './components/mixins/TransactionMixin';
import TranslationMixin from './components/mixins/TranslationMixin';
import NotificationMixin from './components/mixins/NotificationMixin';
import LoadingMixin from './components/mixins/LoadingMixin';
import ReferralRewardsMixin from './components/mixins/ReferralRewardsMixin';
import PaginationSearchMixin from './components/mixins/PaginationSearchMixin';
import CopyAddressMixin from './components/mixins/CopyAddressMixin';
import DialogMixin from './components/mixins/DialogMixin';
import CameraPermissionMixin from './components/mixins/CameraPermissionMixin';

import en from './lang/en';
import internalStore, { modules } from './store'; // `internalStore` is required for local usage
import { storage, runtimeStorage, settingsStorage } from './util/storage';
import { api, connection } from './api';
import { delay, getExplorerLinks, groupRewardsByAssetsList, addFearlessWalletLocally } from './util';
import { SubqueryExplorerService } from './services/subquery';
import { historyElementsFilter } from './services/subquery/queries/historyElements';
import { attachDecorator, createDecoratorsObject, VuexOperation } from './store/util';
import * as VUEX_TYPES from './store/types';
import * as SUBQUERY_TYPES from './services/subquery/types';
import * as WALLET_CONSTS from './consts';
import * as WALLET_TYPES from './types/common';
import { WalletModules } from './store/wallet';

type Store = typeof internalStore;

type PluginOptions = {
  store: Store;
};

let store: Store;

const SoraWalletElements: PluginObject<PluginOptions> = {
  install(vue: typeof Vue, options?: PluginOptions): void {
    if (!options || !options.store) {
      throw new Error('Please provide vuex store.');
    }
    store = options.store;
    installWalletPlugins(vue, store.original);
    vue.component('SoraWallet', SoraWallet); // Root component
  },
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(SoraWalletElements, {});
}

const waitForStore = async (withoutStore = false): Promise<void> => {
  if (!store) {
    if (withoutStore) {
      store = internalStore;
    } else {
      await delay(100);
      await waitForStore(withoutStore);
    }
  }
};

let walletCoreLoaded = false;

const waitForCore = async ({
  withoutStore = false,
  permissions,
  updateEthBridgeHistory,
}: WALLET_CONSTS.WalletInitOptions = {}): Promise<void> => {
  if (!walletCoreLoaded) {
    await Promise.all([waitForStore(withoutStore), api.initKeyring(true)]);

    addFearlessWalletLocally();

    if (permissions) {
      store.commit.wallet.settings.setPermissions(permissions);
    }
    if (updateEthBridgeHistory) {
      store.commit.wallet.transactions.setEthBridgeHistoryUpdateFn(updateEthBridgeHistory);
    }

    store.dispatch.wallet.account.getWhitelist();
    store.dispatch.wallet.account.getNftBlacklist();

    await checkActiveAccount();

    walletCoreLoaded = true;
  }
};

const waitForConnection = async (): Promise<void> => {
  if (connection.loading) {
    await delay(100);
    await waitForConnection();
  } else if (!connection.api) {
    await connection.open();
    console.info('Connected to blockchain', connection.endpoint);
  }
};

const checkActiveAccount = async (): Promise<void> => {
  if (store.state.wallet.account.isDesktop) {
    await store.dispatch.wallet.account.getPolkadotJsAccounts();
  }

  await api.restoreActiveAccount();

  await store.dispatch.wallet.account.checkSigner();
  await store.dispatch.wallet.router.checkCurrentRoute();
};

async function initWallet(options: WALLET_CONSTS.WalletInitOptions = {}): Promise<void> {
  await Promise.all([waitForCore(options), waitForConnection()]);

  await Promise.all([
    api.initialize(false),
    store.dispatch.wallet.subscriptions.activateNetwokSubscriptions(),
    store.dispatch.wallet.subscriptions.activateInternalSubscriptions(store.state.wallet.account.isDesktop),
  ]);

  store.commit.wallet.settings.setWalletLoaded(true);
}

const components = {
  SoraWallet,
  WalletAccount,
  WalletAvatar,
  WalletBase,
  AccountCard,
  AssetList,
  AssetListItem,
  AddAssetDetailsCard,
  ConfirmDialog,
  TokenAddress,
  SearchInput,
  InfoLine,
  FormattedAmount,
  FormattedAmountWithFiatValue,
  TransactionHashView,
  NetworkFeeWarning,
  TokenLogo,
  HistoryPagination,
  DialogBase,
  NotificationEnablingPage,
  SimpleNotification,
};

const mixins = {
  NetworkFeeWarningMixin,
  NumberFormatterMixin,
  FormattedAmountMixin,
  TransactionMixin,
  TranslationMixin,
  NotificationMixin,
  LoadingMixin,
  ReferralRewardsMixin,
  PaginationSearchMixin,
  CopyAddressMixin,
  DialogMixin,
  CameraPermissionMixin,
};

const vuex = {
  walletModules: modules,
  VuexOperation,
  attachDecorator,
  createDecoratorsObject,
  WalletModules,
};

export {
  initWallet,
  waitForCore,
  en,
  api,
  connection,
  storage,
  runtimeStorage,
  settingsStorage,
  getExplorerLinks,
  groupRewardsByAssetsList,
  WALLET_CONSTS,
  WALLET_TYPES,
  components,
  mixins,
  historyElementsFilter,
  SubqueryExplorerService,
  SUBQUERY_TYPES,
  VUEX_TYPES,
  vuex,
};

export default SoraWalletElements;
