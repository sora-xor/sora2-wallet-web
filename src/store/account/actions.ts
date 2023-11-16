import { excludePoolXYKAssets } from '@sora-substrate/util/build/assets';
import CryptoJS from 'crypto-js';
import cryptoRandomString from 'crypto-random-string';
import { defineActions } from 'direct-vuex';

import { api } from '../../api';
import { AppWallet, BLOCK_PRODUCE_TIME, IndexerType } from '../../consts';
import { isInternalSource } from '../../consts/wallets';
import alertsApiService from '../../services/alerts';
import { CeresApiService } from '../../services/ceres';
import { getCurrentIndexer } from '../../services/indexer';
import { rootActionContext } from '../../store';
import {
  getAppWallets,
  getWallet,
  getWalletSigner,
  getImportedAccounts,
  checkWallet,
  subscribeToWalletAccounts,
  WHITE_LIST_URL,
  NFT_BLACK_LIST_URL,
  AppError,
  exportAccountJson,
} from '../../util';

import { accountActionContext } from './../account';

import type { CreateAccountArgs, RestoreAccountArgs } from './types';
import type { FiatPriceObject } from '../../services/indexer/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../../types/common';
import type { AccountAsset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { ActionContext } from 'vuex';

const CHECK_EXTENSION_INTERVAL = 5_000;
const UPDATE_ASSETS_INTERVAL = BLOCK_PRODUCE_TIME * 3;
const PASSPHRASE_TIMEOUT = 15 * 60_000; // 15min

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
  commit.resetFiatPriceSubscription();
  const indexer = getCurrentIndexer();
  const data = await indexer.services.explorer.price.getFiatPriceObject();

  if (data) {
    commit.setFiatPriceObject(data);
  } else {
    commit.clearFiatPriceObject();
  }
}

function subscribeOnFiatUsingCurrentIndexer(context: ActionContext<any, any>): void {
  const { commit } = accountActionContext(context);
  commit.resetFiatPriceSubscription();
  const indexer = getCurrentIndexer();
  const subscription = indexer.services.explorer.price.createFiatPriceSubscription(
    commit.updateFiatPriceObject,
    commit.clearFiatPriceObject
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
  console.info(`The CERES API is used for fiat values.`);
}

async function updateApiSigner(source: AppWallet) {
  const signer = await getWalletSigner(source);

  api.setSigner(signer);
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

  async logout(context, forgetAddress?: string): Promise<void> {
    const { commit, dispatch, state } = accountActionContext(context);
    const { rootDispatch, rootCommit } = rootActionContext(context);

    // Don't forget account on Desktop, if forgetAddress is not passed
    if (!state.isDesktop || forgetAddress) {
      api.forgetAccount(forgetAddress);
    }

    api.logout();

    commit.resetAccountAssetsSubscription();
    rootCommit.wallet.transactions.resetExternalHistorySubscription();
    commit.resetAccount();

    if (forgetAddress) {
      dispatch.updateImportedAccounts();
    }

    await rootDispatch.wallet.router.checkCurrentRoute();
  },

  async checkWalletAvailability(context): Promise<void> {
    const { dispatch, getters, state } = accountActionContext(context);

    if (!(getters.isLoggedIn && state.source)) return;

    try {
      if (state.isExternal) {
        await updateApiSigner(state.source);
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
      const accounts = getImportedAccounts();
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

    const subscription = await subscribeToWalletAccounts(wallet, callback);

    commit.setWalletAccountsSubscription(subscription);
  },

  async loginAccount(context, accountData: PolkadotJsAccount): Promise<void> {
    const { commit, dispatch, state } = accountActionContext(context);

    // Desktop has not source
    const source = (accountData.source as AppWallet) || '';
    const isExternal = !isInternalSource(source);
    const defaultAddress = api.formatAddress(accountData.address, false);
    const soraAddress = api.formatAddress(defaultAddress);

    // Don't forget account:
    // 1) on Desktop;
    // 2) When the login and api addresses are the same;
    if (!state.isDesktop && api.address !== soraAddress) {
      api.forgetAccount();
    }

    api.logout();

    if (isExternal) {
      // we should update signer
      await updateApiSigner(source);
    }

    await api.loginAccount(defaultAddress, accountData.name, source, isExternal);

    commit.syncWithStorage();

    await dispatch.afterLogin();
  },

  async createAccount(
    context,
    { seed, name, password, passwordConfirm, saveAccount, exportAccount }: CreateAccountArgs
  ): Promise<KeyringPair$Json> {
    const { dispatch, state } = accountActionContext(context);

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
    const { dispatch, state } = accountActionContext(context);
    // restore from json file
    api.restoreAccountFromJson(json, password);
    // update account list in state
    dispatch.updateImportedAccounts();
  },

  async renameAccount(context, { address, name }: { address: string; name: string }) {
    const { commit, dispatch, state } = accountActionContext(context);
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
  exportAccount(_, { address, password }: { address: string; password: string }): void {
    const pair = api.getAccountPair(address);
    const accountJson = pair.toJson(password);
    exportAccountJson(accountJson);
  },

  /**
   * Desktop
   */
  async setAccountPassphrase(context, passphrase) {
    const key = cryptoRandomString({ length: 10, type: 'ascii-printable' });
    const passphraseEncoded = CryptoJS.AES.encrypt(passphrase, key).toString();

    const { commit } = accountActionContext(context);

    commit.resetAccountPassphraseTimer();
    commit.updateAddressGeneratedKey(key);
    commit.setAccountPassphrase(passphraseEncoded);

    const timer = setTimeout(commit.resetAccountPassphrase, PASSPHRASE_TIMEOUT);
    commit.setAccountPassphraseTimer(timer);
  },

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
      const allIds = allAssets.map((asset) => asset.address);
      const filtered = excludePoolXYKAssets(allAssets);

      commit.setAssetsIds(allIds);
      commit.setAssets(filtered);
    } catch (error) {
      console.warn('Connection was lost during getAssets operation');
      throw error;
    }
  },

  async getNewAssets(context): Promise<void> {
    try {
      const { state, getters, commit } = accountActionContext(context);

      const savedIds = new Set(state.assetsIds);
      const ids = await withTimeout(api.assets.getAssetsIds(getters.blacklist));
      const newIds = ids.filter((id) => !savedIds.has(id));

      if (newIds.length) {
        const newAssets = await Promise.all(newIds.map((id) => withTimeout(api.assets.getAssetInfo(id))));
        const newFilteredAssets = excludePoolXYKAssets(newAssets);

        commit.setAssetsIds(ids);
        commit.setAssets([...state.assets, ...newFilteredAssets]);
      }
    } catch (error) {
      console.warn('Error while updating assets:', error);
    }
  },

  async subscribeOnAssets(context): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);

    await dispatch.getAssets();

    const timer = setInterval(() => {
      dispatch.getNewAssets();
    }, UPDATE_ASSETS_INTERVAL);

    commit.setAssetsSubscription(timer);
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

  async getAccountReferralRewards(context): Promise<void> {
    const { state, commit } = accountActionContext(context);
    commit.clearReferralRewards();
    const indexer = getCurrentIndexer();
    const data = await indexer.services.explorer.account.getReferralRewards(state.address);
    if (data) {
      commit.setReferralRewards(data);
    }
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

    await api.transfer(asset, to, amount);
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
  /** It's used **only** for subscriptions module */
  async resetAccountPassphraseTimer(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.resetAccountPassphraseTimer();
  },
});

export default actions;
