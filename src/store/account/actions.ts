import { excludePoolXYKAssets } from '@sora-substrate/util/build/assets';
import { AES } from 'crypto-js';
import cryptoRandomString from 'crypto-random-string';
import { defineActions } from 'direct-vuex';

import { api } from '../../api';
import { AppWallet, BLOCK_PRODUCE_TIME } from '../../consts';
import alertsApiService from '../../services/alerts';
import { CeresApiService } from '../../services/ceres';
import { getCurrentIndexer } from '../../services/indexer';
import { rootActionContext } from '../../store';
import { WHITE_LIST_URL, NFT_BLACK_LIST_URL, AppError } from '../../util';
import {
  getAppWallets,
  getWallet,
  updateApiSigner,
  getImportedAccounts,
  checkWallet,
  subscribeToWalletAccounts,
  exportAccountJson,
  loginApi,
  logoutApi,
} from '../../util/account';

import { accountActionContext } from './../account';

import type { CreateAccountArgs, RestoreAccountArgs } from './types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../../types/common';
import type { AccountAsset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { ActionContext } from 'vuex';

const CHECK_EXTENSION_INTERVAL = 5_000;
const UPDATE_ASSETS_INTERVAL = BLOCK_PRODUCE_TIME * 3;

// [TODO]: change WsProvider timeout instead on this
const withTimeout = <T>(func: Promise<T>, timeout = UPDATE_ASSETS_INTERVAL) => {
  return Promise.race([
    func,
    new Promise<never>((resolve, reject) => {
      setTimeout(() => reject(new Error('Request Timeout')), timeout);
    }),
  ]);
};

// INDEXER
async function getFiatPriceObjectUsingIndexer(context: ActionContext<any, any>): Promise<void> {
  const { commit } = accountActionContext(context);
  const indexer = getCurrentIndexer();
  const data = await indexer.services.explorer.price.getFiatPriceObject();

  if (data) {
    commit.setFiatPriceObject(data);
  } else {
    commit.clearFiatPriceObject();
  }
}

async function getFiatPriceUpdatesUsingIndexer(context: ActionContext<any, any>): Promise<void> {
  const { commit } = accountActionContext(context);
  const indexer = getCurrentIndexer();
  const data = await indexer.services.explorer.price.getFiatPriceUpdates();

  if (data) {
    commit.updateFiatPriceObject(data);
  }
}

function subscribeOnFiatUsingCurrentIndexer(context: ActionContext<any, any>): void {
  const { commit, dispatch } = accountActionContext(context);
  commit.resetFiatPriceSubscription();
  const indexer = getCurrentIndexer();
  const subscription = indexer.services.explorer.price.createFiatPriceSubscription(
    (priceObject) => {
      if (priceObject) {
        commit.updateFiatPriceObject(priceObject);
      } else {
        getFiatPriceUpdatesUsingIndexer(context);
      }
    },
    () => dispatch.useCeresApiForFiatValues(true)
  );

  commit.setFiatPriceSubscription(subscription);
}

async function useFiatValuesFromIndexer(context: ActionContext<any, any>): Promise<void> {
  await getFiatPriceObjectUsingIndexer(context);
  subscribeOnFiatUsingCurrentIndexer(context);
}

// CERES
async function getFiatPriceObjectUsingCeresApi(context: ActionContext<any, any>): Promise<void> {
  const { commit } = accountActionContext(context);
  const data = await CeresApiService.getFiatPriceObject();
  if (data) {
    commit.setFiatPriceObject(data);
  } else {
    commit.clearFiatPriceObject();
  }
}

function subscribeOnFiatUsingCeresApi(context: ActionContext<any, any>): void {
  const { commit } = accountActionContext(context);
  commit.resetFiatPriceSubscription();
  const subscription = CeresApiService.createFiatPriceSubscription(
    commit.updateFiatPriceObject,
    commit.clearFiatPriceObject
  );
  commit.setFiatPriceSubscription(subscription);
}

async function useFiatValuesFromCeresApi(context: ActionContext<any, any>): Promise<void> {
  await getFiatPriceObjectUsingCeresApi(context);
  subscribeOnFiatUsingCeresApi(context);
  console.info(`[CERES API] Fiat values subscribe.`);
}

const actions = defineActions({
  async afterLogin(context): Promise<void> {
    const { dispatch } = accountActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    await dispatch.subscribeOnAccountAssets();
    await rootDispatch.wallet.transactions.subscribeOnExternalHistory();
    await dispatch.resetSelectedWallet();
    await rootDispatch.wallet.router.checkCurrentRoute();
  },

  async logout(context): Promise<void> {
    const { commit, state } = accountActionContext(context);
    const { rootDispatch, rootCommit } = rootActionContext(context);

    logoutApi(api, !state.isDesktop);

    commit.resetAccountAssetsSubscription();
    rootCommit.wallet.transactions.resetExternalHistorySubscription();
    commit.resetAccount();

    await rootDispatch.wallet.router.checkCurrentRoute();
  },

  async checkWalletAvailability(context): Promise<void> {
    const { dispatch, getters, state } = accountActionContext(context);

    if (!(getters.isLoggedIn && state.source)) return;

    try {
      if (state.isExternal) {
        await updateApiSigner(api, state.source);
      } else {
        checkWallet(state.source);
      }
    } catch (error) {
      console.error(error);
      await dispatch.logout();
    }
  },

  /**
   * Update the list of installed extensions & internal wallets
   */
  async updateAvailableWallets(context): Promise<void> {
    const { commit } = accountActionContext(context);

    try {
      const wallets = getAppWallets();

      commit.setAvailableWallets(wallets);
    } catch (error) {
      console.error(error);
      commit.setAvailableWallets([]);
    }
  },

  async checkSelectedWallet(context): Promise<void> {
    const { dispatch, state } = accountActionContext(context);
    try {
      if (state.selectedWallet && !state.selectedWalletLoading) {
        await getWallet(state.selectedWallet);
      }
    } catch (error) {
      console.error(error);
      await dispatch.resetSelectedWallet();
      await dispatch.logout();
    }
  },

  async selectWallet(context, extension: AppWallet): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);

    try {
      commit.resetWalletAccountsSubscription();
      commit.setSelectedWallet(extension);
      commit.setSelectedWalletLoading(true);

      await getWallet(extension);

      commit.setSelectedWalletLoading(false);

      await dispatch.subscribeToWalletAccounts();
    } catch (error) {
      dispatch.resetSelectedWallet();
      throw error;
    }
  },

  resetSelectedWallet(context): void {
    const { commit } = accountActionContext(context);

    commit.resetWalletAccountsSubscription();
    commit.setSelectedWallet();
    commit.setSelectedWalletLoading(false);
  },

  async subscribeOnWalletAvailability(context): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);

    const runChecks = async () =>
      await Promise.all([dispatch.updateAvailableWallets(), dispatch.checkSelectedWallet()]);

    await runChecks();

    const timer = setInterval(runChecks, CHECK_EXTENSION_INTERVAL);

    commit.setWalletAvailabilitySubscription(timer);
  },

  updateImportedAccounts(context): void {
    const { commit, state } = accountActionContext(context);

    if (state.isDesktop) {
      const accounts = getImportedAccounts(api);
      commit.setWalletAccounts(accounts);
    }
  },

  async subscribeToWalletAccounts(context): Promise<void> {
    const { commit, state } = accountActionContext(context);
    const wallet = state.selectedWallet;

    if (!wallet) return;

    const callback = (accounts: PolkadotJsAccount[]) => {
      if (wallet === state.selectedWallet) {
        commit.setWalletAccounts(accounts);
      }
    };

    const subscription = await subscribeToWalletAccounts(api, wallet, callback);

    commit.setWalletAccountsSubscription(subscription);
  },

  async loginAccount(context, accountData: PolkadotJsAccount): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);

    await loginApi(api, accountData);

    commit.syncWithStorage();

    await dispatch.afterLogin();
  },

  async createAccount(
    context,
    { seed, name, password, passwordConfirm, saveAccount, exportAccount }: CreateAccountArgs
  ): Promise<KeyringPair$Json> {
    const { dispatch } = accountActionContext(context);

    if (passwordConfirm && password !== passwordConfirm) {
      throw new AppError({ key: 'desktop.errorMessages.passwords' });
    }

    const pair = api.createAccountPair(seed, name);
    const json = pair.toJson(password);

    if (exportAccount) {
      exportAccountJson(json);
    }

    if (saveAccount) {
      api.addAccountPair(pair, password);
      // update account list in state
      dispatch.updateImportedAccounts();
    }

    return json;
  },

  async restoreAccountFromJson(context, { json, password }: RestoreAccountArgs) {
    const { dispatch } = accountActionContext(context);
    // restore from json file
    api.restoreAccountFromJson(json, password);
    // update account list in state
    dispatch.updateImportedAccounts();
  },

  async renameAccount(context, { address, name }: { address: string; name: string }) {
    const { commit, dispatch } = accountActionContext(context);
    // change name in api & storage
    api.changeAccountName(address, name);
    // update account data from storage
    commit.syncWithStorage();
    // update account list in state
    dispatch.updateImportedAccounts();
  },

  /**
   * Desktop
   */
  deleteAccount(context, address?: string): void {
    const { dispatch } = accountActionContext(context);
    // delete account pair
    api.forgetAccount(address);
    // update account list in state
    dispatch.updateImportedAccounts();
  },

  /**
   * Desktop
   */
  exportAccount(_, { address, password }: { address: string; password: string }): void {
    const pair = api.getAccountPair(address);
    const accountJson = pair.toJson(password);
    exportAccountJson(accountJson);
  },

  /**
   * Desktop
   */
  setAccountPassphrase(context, { address, password }: { address: string; password: string }): void {
    const key = cryptoRandomString({ length: 10, type: 'ascii-printable' });
    const passphrase = AES.encrypt(password, key).toString();

    const { commit, dispatch, state } = accountActionContext(context);

    dispatch.resetAccountPassphrase(address);

    commit.updateAddressGeneratedKey({ address, key });
    commit.setAccountPassphrase({ address, passphrase });

    const timer = setTimeout(() => dispatch.resetAccountPassphrase(address), state.accountPasswordTimeout);
    commit.setAccountPassphraseTimer({ address, timer });
  },

  resetAccountPassphrase(context, address: string): void {
    const { commit } = accountActionContext(context);
    commit.resetAccountPassphraseTimer(address);
    commit.resetAccountPassphrase(address);
  },

  lockAccountPair(context): void {
    api.lockPair();
  },

  unlockAccountPair(context, passphrase: string): void {
    api.unlockPair(passphrase);
  },

  // [NOTE]: Desktop is not syncing, because it runs in one flow
  async syncWithStorage(context): Promise<void> {
    const { state, getters, commit, dispatch } = accountActionContext(context);
    // previous state
    const { isLoggedIn: wasLoggedIn } = getters;
    const { address } = state;

    commit.syncWithStorage();

    // check log in/out state changes after sync
    if (getters.isLoggedIn !== wasLoggedIn || state.address !== address) {
      if (getters.isLoggedIn) {
        const account = { address: state.address, name: state.name, source: state.source as AppWallet };
        await dispatch.loginAccount(account);
      } else {
        await dispatch.logout();
      }
    }

    // still logged in after sync
    if (getters.isLoggedIn && wasLoggedIn) {
      await api.assets.updateAccountAssets();
    }
  },

  async getAssets(context): Promise<void> {
    const { getters, commit } = accountActionContext(context);
    try {
      const allAssets = await withTimeout(api.assets.getAssets(true, getters.whitelist, getters.blacklist));
      const filtered = excludePoolXYKAssets(allAssets);

      commit.setAssets(filtered);
    } catch (error) {
      console.warn('Connection was lost during getAssets operation');
      throw error;
    }
  },

  async subscribeOnAssets(context): Promise<void> {
    const { commit, dispatch, state } = accountActionContext(context);

    commit.resetAssetsSubscription();

    await dispatch.getAssets();

    const indexer = getCurrentIndexer();

    const subscription = indexer.services.explorer.asset.createNewAssetsSubscription((newAssets) => {
      if (newAssets.length) {
        commit.setAssets([...state.assets, ...newAssets]);
      }
    }, console.error);

    commit.setAssetsSubscription(subscription);
  },

  async subscribeOnAccountAssets(context): Promise<void> {
    const { commit, getters } = accountActionContext(context);
    commit.resetAccountAssetsSubscription();

    if (getters.isLoggedIn) {
      try {
        const subscription = api.assets.balanceUpdated.subscribe(() => {
          const filtered = api.assets.accountAssets.filter(
            (asset) => !api.assets.isNftBlacklisted(asset, getters.blacklist)
          );
          commit.setAccountAssets(filtered);
        });
        commit.setAccountAssetsSubscription(subscription);
        await api.assets.updateAccountAssets();
      } catch (error) {
        commit.setAccountAssets([]);
      }
    }
  },
  async getWhitelist(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.clearWhitelist();
    try {
      const response = await fetch(WHITE_LIST_URL, { cache: 'no-cache' });
      const data = await response.json();
      commit.setWhitelist(data);
    } catch (error) {
      commit.clearWhitelist();
    }
  },
  async getNftBlacklist(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.clearBlacklist();
    try {
      const response = await fetch(NFT_BLACK_LIST_URL, { cache: 'no-cache' });
      const data = await response.json();
      commit.setNftBlacklist(data);
    } catch (error) {
      commit.clearBlacklist();
    }
  },
  async subscribeOnAlerts(context): Promise<void> {
    const { commit } = accountActionContext(context);

    const alertSubject = alertsApiService.createPriceAlertSubscription();
    commit.setAlertSubject(alertSubject);
  },

  async subscribeOnFiatPrice(context): Promise<void> {
    const { state } = accountActionContext(context);

    if (!state.ceresFiatValuesUsage) {
      await useFiatValuesFromIndexer(context);
    } else {
      await useFiatValuesFromCeresApi(context);
    }
  },

  async useCeresApiForFiatValues(context, flag: boolean): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);
    commit.setCeresFiatValuesUsage(flag);
    await dispatch.subscribeOnFiatPrice();
  },

  async notifyOnDeposit(context, data): Promise<void> {
    const { commit } = accountActionContext(context);
    const { asset, message }: { asset: WhitelistArrayItem; message: string } = data;
    alertsApiService.pushNotification(asset, message);
    commit.popAssetFromNotificationQueue();
  },
  async addAsset(_, address?: string): Promise<void> {
    if (!address) return;
    try {
      await api.assets.addAccountAsset(address);
    } catch (error) {
      console.error('[Add asset]:', error);
    }
  },
  async transfer(context, { to, amount }: { to: string; amount: string }): Promise<void> {
    const { rootState } = rootActionContext(context);

    const asset = rootState.wallet.router.currentRouteParams.asset as AccountAsset;

    await api.assets.simpleTransfer(asset, to, amount);
  },
  /** It's used **only** for subscriptions module */
  async resetAssetsSubscription(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.resetAssetsSubscription();
  },
  /** It's used **only** for subscriptions module */
  async resetAccountAssetsSubscription(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.resetAccountAssetsSubscription();
  },
  /** It's used **only** for subscriptions module */
  async resetFiatPriceSubscription(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.resetFiatPriceSubscription();
  },
  /** It's used **only** for subscriptions module */
  async resetWalletAvailabilitySubscription(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.resetWalletAvailabilitySubscription();
  },
});

export default actions;
