/**
 * Entry point for the SORA wallet Vue plugin. This module wires together the
 * public API surface that host applications rely on: the plugin installer,
 * exported components, Vuex helpers, and utility functions.
 */
import { createPinia, type Pinia } from 'pinia';

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
import ConfirmDialog from './components/ConfirmDialog.vue';
import ConnectionView from './components/Connection/ConnectionView.vue';
import AccountConnectionList from './components/Connection/List/Account.vue';
import ConnectionItems from './components/Connection/List/ConnectionItems.vue';
import ExtensionConnectionList from './components/Connection/List/Extension.vue';
import DialogBase from './components/DialogBase.vue';
import FileUploader from './components/FileUploader.vue';
import FormattedAmount from './components/FormattedAmount.vue';
import FormattedAmountWithFiatValue from './components/FormattedAmountWithFiatValue.vue';
import HistoryPagination from './components/HistoryPagination.vue';
import InfoLine from './components/InfoLine.vue';
import SearchInput from './components/Input/SearchInput.vue';
import CameraPermissionMixin from './components/mixins/CameraPermissionMixin';
import CopyAddressMixin from './components/mixins/CopyAddressMixin';
import FormattedAmountMixin from './components/mixins/FormattedAmountMixin';
import LoadingMixin from './components/mixins/LoadingMixin';
import NetworkFeeWarningMixin from './components/mixins/NetworkFeeWarningMixin';
import NotificationMixin from './components/mixins/NotificationMixin';
import NumberFormatterMixin from './components/mixins/NumberFormatterMixin';
import PaginationSearchMixin from './components/mixins/PaginationSearchMixin';
import TransactionMixin from './components/mixins/TransactionMixin';
import TranslationMixin from './components/mixins/TranslationMixin';
import NetworkFeeWarning from './components/NetworkFeeWarning.vue';
import NftDetails from './components/NftDetails.vue';
import NotificationEnablingPage from './components/NotificationEnablingPage.vue';
import PinIcon from './components/PinIcon.vue';
import AssetsFilter from './components/shared/AssetsFilter.vue';
import ExternalLink from './components/shared/ExternalLink.vue';
import FormattedAddress from './components/shared/FormattedAddress.vue';
import SyntheticSwitcher from './components/shared/SyntheticSwitcher.vue';
import SimpleNotification from './components/SimpleNotification.vue';
import TokenAddress from './components/TokenAddress.vue';
import TokenLogo from './components/TokenLogo.vue';
import TransactionHashView from './components/TransactionHashView.vue';
import WalletBase from './components/WalletBase.vue';
import WalletFee from './components/WalletFee.vue';
// Shared Components
// Other
import * as WALLET_CONSTS from './consts';
import en from './lang/en';
import installWalletPlugins from './plugins';
import AlertsApiService from './services/alerts';
import { addGDriveWalletLocally } from './services/google/wallet';
import { getCurrentIndexer } from './services/indexer';
import * as SUBQUERY_TYPES from './services/indexer/subquery/types';
import { historyElementsFilter } from './services/indexer/subsquid/queries/historyElements';
import * as SUBSQUID_TYPES from './services/indexer/subsquid/types';
import * as INDEXER_TYPES from './services/indexer/types';
import { addSoraWalletLocally } from './services/sorawallet';
import { initializeWallets } from './services/wallet';
import * as WC from './services/walletconnect';
import { addWcSubWalletLocally } from './services/walletconnect';
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
  getAssetsSubset,
} from './util';
import * as accountUtils from './util/account';
import { ScriptLoader } from './util/scriptLoader';
import { storage, runtimeStorage, settingsStorage } from './util/storage';

import type { WithKeyring } from '@sora-substrate/sdk';
import type { App, Plugin } from 'vue';

type Store = typeof internalStore;
type PluginOptions = {
  store: Store;
  pinia?: Pinia;
};

let store: Store;
let piniaInstance: Pinia | undefined;

/**
 * Vue plugin definition that registers the wallet into the host application.
 * The plugin expects a Vuex store so it can connect the internal modules.
 */
const SoraWalletElements: Plugin<PluginOptions> = {
  install(app: App, options?: PluginOptions): void {
    if (!options || !options.store) {
      throw new Error('Please provide vuex store.');
    }
    store = options.store;
    piniaInstance = options.pinia ?? piniaInstance ?? createPinia();

    if (!app.config.globalProperties.$pinia && piniaInstance) {
      app.use(piniaInstance);
    }

    installWalletPlugins(app);
    app.component('SoraWallet', SoraWallet); // Root component
  },
};

/**
 * Initializes built-in wallet integrations and local storage depending on the
 * runtime environment (desktop vs web). The initialization is intentionally
 * side-effectful because the wallet modules depend on these registrations.
 */
const initAppWallets = (api: WithKeyring, isDesktop = false, appName?: string) => {
  const dAppName = appName ?? WALLET_CONSTS.TranslationConsts.Polkaswap;

  if (isDesktop) {
    addSoraWalletLocally(api, dAppName);
  } else {
    addGDriveWalletLocally(dAppName);
  }

  addWcSubWalletLocally(api, (source) => {
    store.dispatch.wallet.account.checkConnectedAccountSource(source);
    store.dispatch.wallet.account.updateAvailableWallets();
  });

  initializeWallets(dAppName);

  store.dispatch.wallet.account.updateAvailableWallets();
};

/**
 * Ensures the Vuex store instance is ready before running wallet logic. The
 * wallet can work with either an injected store from the host app or the
 * internal store used by standalone mode, so we wait until one is available.
 */
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

/**
 * Lazily bootstraps the wallet core by waiting for the store and keyring to
 * initialize, then fetching runtime data and applying permission overrides.
 * The function is idempotent so subsequent calls resolve immediately.
 */
const waitForCore = async ({
  withoutStore = false,
  permissions,
}: WALLET_CONSTS.WalletInitOptions = {}): Promise<void> => {
  if (!walletCoreLoaded) {
    await Promise.all([waitForStore(withoutStore), api.initKeyring(true)]);

    if (permissions) {
      store.commit.wallet.settings.setPermissions(permissions);
    }

    store.dispatch.wallet.account.getWhitelist();
    store.dispatch.wallet.account.getNftBlacklist();

    walletCoreLoaded = true;
  }
};

/**
 * Waits for an active blockchain connection before continuing. The helper
 * retries until the API instance is ready so that higher level flows can be
 * written without defensive checks at every stage.
 */
const waitForConnection = async (): Promise<void> => {
  if (connection.loading) {
    await delay(100);
    await waitForConnection();
  } else if (!connection.api) {
    await connection.open();
    console.info('Connected to blockchain', connection.endpoint);
  }
};

/**
 * Restores the last active account and refreshes all computed state that
 * depends on it. This includes route guards and wallet availability checks.
 */
const checkActiveAccount = async (): Promise<void> => {
  await api.restoreActiveAccount();
  await store.dispatch.wallet.account.checkWalletAvailability();
  await store.dispatch.wallet.router.checkCurrentRoute();
};

/**
 * Public initializer that brings the wallet online. Consumers should await
 * this function before interacting with any wallet services.
 */
async function initWallet(options: WALLET_CONSTS.WalletInitOptions = {}): Promise<void> {
  await Promise.all([waitForCore(options), waitForConnection()]);

  initAppWallets(api, store.state.wallet.account.isDesktop, options.appName);
  await checkActiveAccount();

  // don't wait for finalization of internal & external services subscriptions
  store.dispatch.wallet.subscriptions.activateInternalSubscriptions();
  store.dispatch.wallet.settings.selectIndexer();
  // wait for finalization of network subscriptions
  await Promise.all([api.initialize(false), store.dispatch.wallet.subscriptions.activateNetwokSubscriptions()]);
  store.commit.wallet.settings.setIsMstAvailable(
    store.state.wallet.account.source === WALLET_CONSTS.AppWallet.FearlessWallet
  );
  store.dispatch.wallet.account.initMultisigAddress();
  store.commit.wallet.settings.setWalletLoaded(true);
}

/**
 * Public registry of Vue components that can be consumed individually by the
 * host application when the full plugin is not desired.
 */
const components = {
  SoraWallet,
  WalletAccount,
  WalletAvatar,
  WalletBase,
  WalletFee,
  AccountCard,
  AccountConfirmationOption,
  AddressBookInput,
  AssetsFilter,
  AssetList,
  AssetListItem,
  AddAssetDetailsCard,
  ConfirmDialog,
  TokenAddress,
  SearchInput,
  InfoLine,
  FormattedAmount,
  FormattedAmountWithFiatValue,
  FileUploader,
  TransactionHashView,
  NetworkFeeWarning,
  TokenLogo,
  NftDetails,
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
  PinIcon,
};

/**
 * Convenience export for the core mixins. These are kept separate so host
 * applications can register only the behaviors they need.
 */
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
  CameraPermissionMixin,
};

/**
 * Exposes Vuex utilities that allow consumers to interact with the wallet
 * store using decorators or manual module registration.
 */
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
  getAssetsSubset,
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
  WC,
  vuex,
};

export { useDialogVisibility } from './composables/useDialog';
export { useNotification } from './composables/useNotification';
export { useTranslation } from './composables/useTranslation';
export { useNotificationStore } from './stores/notification';

export type { PluginOptions };

export default SoraWalletElements;
