import { api, connection } from './api';
// Components & Mixins
import AccountCard from './components/Account/AccountCard.vue';
import AccountConfirmationOption from './components/Account/Settings/ConfirmationOption.vue';
import WalletAccount from './components/Account/WalletAccount.vue';
import WalletAvatar from './components/Account/WalletAvatar.vue';
import AddAssetDetailsCard from './components/AddAsset/AddAssetDetailsCard.vue';
import AddressBookInput from './components/AddressBook/Input.vue';
import AssetList from './components/AssetList.vue';
import AssetListItem from './components/AssetListItem.vue';
import TokenLogo from './components/AssetLogos/TokenLogo.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import ConnectionView from './components/Connection/ConnectionView.vue';
import AccountConnectionList from './components/Connection/List/Account.vue';
import ConnectionItems from './components/Connection/List/ConnectionItems.vue';
import ExtensionConnectionList from './components/Connection/List/Extension.vue';
import DialogBase from './components/DialogBase.vue';
import FormattedAmount from './components/FormattedAmount.vue';
import FormattedAmountWithFiatValue from './components/FormattedAmountWithFiatValue.vue';
import HistoryPagination from './components/HistoryPagination.vue';
import InfoLine from './components/InfoLine.vue';
import SearchInput from './components/Input/SearchInput.vue';
import CameraPermissionMixin from './components/mixins/CameraPermissionMixin';
import CopyAddressMixin from './components/mixins/CopyAddressMixin';
import DialogMixin from './components/mixins/DialogMixin';
import FormattedAmountMixin from './components/mixins/FormattedAmountMixin';
import LoadingMixin from './components/mixins/LoadingMixin';
import NetworkFeeWarningMixin from './components/mixins/NetworkFeeWarningMixin';
import NotificationMixin from './components/mixins/NotificationMixin';
import NumberFormatterMixin from './components/mixins/NumberFormatterMixin';
import PaginationSearchMixin from './components/mixins/PaginationSearchMixin';
import TransactionMixin from './components/mixins/TransactionMixin';
import TranslationMixin from './components/mixins/TranslationMixin';
import NetworkFeeWarning from './components/NetworkFeeWarning.vue';
import NotificationEnablingPage from './components/NotificationEnablingPage.vue';
import ExternalLink from './components/shared/ExternalLink.vue';
import FormattedAddress from './components/shared/FormattedAddress.vue';
import SyntheticSwitcher from './components/shared/SyntheticSwitcher.vue';
import SimpleNotification from './components/SimpleNotification.vue';
import TokenAddress from './components/TokenAddress.vue';
import TransactionHashView from './components/TransactionHashView.vue';
import WalletBase from './components/WalletBase.vue';
import WalletFee from './components/WalletFee.vue';
// Shared Components
// Other
import * as WALLET_CONSTS from './consts';
import en from './lang/en';
import installWalletPlugins from './plugins';
import AlertsApiService from './services/alerts';
import { getCurrentIndexer } from './services/indexer';
import * as SUBQUERY_TYPES from './services/indexer/subquery/types';
import { historyElementsFilter } from './services/indexer/subsquid/queries/historyElements';
import * as SUBSQUID_TYPES from './services/indexer/subsquid/types';
import * as INDEXER_TYPES from './services/indexer/types';
import SoraWallet from './SoraWallet.vue';
import internalStore, { modules } from './store'; // `internalStore` is required for local usage
import * as VUEX_TYPES from './store/types';
import { attachDecorator, createDecoratorsObject, VuexOperation } from './store/util';
import { WalletModules } from './store/wallet';
import * as WALLET_TYPES from './types/common';
import {
  delay,
  getExplorerLinks,
  groupRewardsByAssetsList,
  formatAccountAddress,
  validateAddress,
  beforeTransactionSign,
} from './util';
import * as accountUtils from './util/account';
import { ScriptLoader } from './util/scriptLoader';
import { storage, runtimeStorage, settingsStorage } from './util/storage';

import type { PluginObject } from 'vue';
import type Vue from 'vue';

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
  appName,
  permissions,
  updateEthBridgeHistory,
}: WALLET_CONSTS.WalletInitOptions = {}): Promise<void> => {
  if (!walletCoreLoaded) {
    await Promise.all([waitForStore(withoutStore), api.initKeyring(true)]);

    accountUtils.initAppWallets(appName);

    if (permissions) {
      store.commit.wallet.settings.setPermissions(permissions);
    }
    if (updateEthBridgeHistory) {
      store.commit.wallet.transactions.setEthBridgeHistoryUpdateFn(updateEthBridgeHistory);
    }

    store.dispatch.wallet.account.getWhitelist();
    store.dispatch.wallet.account.getNftBlacklist();

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
  await api.restoreActiveAccount();
  await store.dispatch.wallet.account.checkWalletAvailability();
  await store.dispatch.wallet.router.checkCurrentRoute();
};

async function initWallet(options: WALLET_CONSTS.WalletInitOptions = {}): Promise<void> {
  await Promise.all([waitForCore(options), waitForConnection()]);

  await checkActiveAccount();

  // don't wait for finalization of internal & external services subscriptions
  store.dispatch.wallet.account.updateAvailableWallets();
  store.dispatch.wallet.subscriptions.activateInternalSubscriptions();
  store.dispatch.wallet.settings.selectIndexer();
  // wait for finalization of network subscriptions
  await Promise.all([api.initialize(false), store.dispatch.wallet.subscriptions.activateNetwokSubscriptions()]);

  store.commit.wallet.settings.setWalletLoaded(true);
}

const components = {
  SoraWallet,
  WalletAccount,
  WalletAvatar,
  WalletBase,

  AccountCard,
  AccountConfirmationOption,
  AddressBookInput,
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
  ConnectionItems,
  SyntheticSwitcher,
  ExternalLink,
  FormattedAddress,
  AccountConnectionList,
  ExtensionConnectionList,
  ConnectionView,
};

const mixins = {
  NetworkFeeWarningMixin,
  NumberFormatterMixin,
  FormattedAmountMixin,
  TransactionMixin,
  TranslationMixin,
  NotificationMixin,
  LoadingMixin,
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
  formatAccountAddress,
  validateAddress,
  beforeTransactionSign,
  WALLET_CONSTS,
  WALLET_TYPES,
  components,
  mixins,
  accountUtils,
  ScriptLoader,
  historyElementsFilter,
  AlertsApiService,
  getCurrentIndexer,
  SUBQUERY_TYPES,
  SUBSQUID_TYPES,
  INDEXER_TYPES,
  VUEX_TYPES,
  vuex,
};

export default SoraWalletElements;
