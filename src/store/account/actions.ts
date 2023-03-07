import { defineActions } from 'direct-vuex';
import CryptoJS from 'crypto-js';
import cryptoRandomString from 'crypto-random-string';
import { saveAs } from 'file-saver';
import { excludePoolXYKAssets } from '@sora-substrate/util/build/assets';
import type { ActionContext } from 'vuex';
import type { Signer } from '@polkadot/api/types';
import type { AccountAsset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

import { accountActionContext } from './../account';
import { rootActionContext } from '../../store';
import { api } from '../../api';
import { SubqueryExplorerService } from '../../services/subquery';
import { CeresApiService } from '../../services/ceres';
import { pushNotification } from '../../util/notification';
import {
  delay,
  getAppWallets,
  getWallet,
  getWalletSigner,
  getImportedAccounts,
  subscribeToWalletAccounts,
  WHITE_LIST_URL,
  NFT_BLACK_LIST_URL,
  AppError,
} from '../../util';
import { AppWallet, BLOCK_PRODUCE_TIME } from '../../consts';
import { isInternalSource } from '../../consts/wallets';

import type { PolkadotJsAccount, KeyringPair$Json } from '../../types/common';
import type { FiatPriceObject } from '../../services/subquery/types';
import type { CreateAccountArgs } from './types';

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

function subscribeOnFiatUsingSubquery(context: ActionContext<any, any>): void {
  const { commit } = accountActionContext(context);
  const subscription = SubqueryExplorerService.price.createFiatPriceSubscription(
    (payload?: FiatPriceObject) => {
      commit.updateFiatPriceObject(payload);
    },
    () => {
      commit.clearFiatPriceObject();
    }
  );
  commit.setFiatPriceSubscription(subscription);
}

function subscribeOnFiatUsingCeresApi(context: ActionContext<any, any>, error?: Error): void {
  const { commit } = accountActionContext(context);
  if (error) {
    console.warn(error);
  }
  console.info('Subquery cannot set fiat subscription! CERES API will be used');
  const subscription = CeresApiService.createFiatPriceSubscription(
    commit.updateFiatPriceObject,
    commit.clearFiatPriceObject
  );
  commit.setFiatPriceSubscription(subscription);
}

/**
 * Returns `true`, if subquery is stable and up.
 *
 * Returns `false`, if subquery is down but CERES api works fine.
 *
 * Returns `null`, if both services are unavailable.
 */
async function getFiatPriceObject(context: ActionContext<any, any>): Promise<Nullable<boolean>> {
  const { commit } = accountActionContext(context);
  commit.resetFiatPriceSubscription();
  try {
    let data = await SubqueryExplorerService.price.getFiatPriceObject();
    if (data) {
      commit.setFiatPriceObject(data);
      return true;
    }
    data = await CeresApiService.getFiatPriceObject();
    if (data) {
      commit.setFiatPriceObject(data);
      return false;
    }
    // If data is empty
    commit.clearFiatPriceObject();
    return null;
  } catch (error) {
    commit.clearFiatPriceObject();
    return null;
  }
}

function logoutApi(forgetAccount?: boolean): void {
  if (api.accountPair) {
    api.logout(forgetAccount);
  }
}

function exportAccountJson(accountJson: string): void {
  const blob = new Blob([accountJson], { type: 'application/json' });
  const filename = (JSON.parse(accountJson) || {}).address || '';
  saveAs(blob, filename);
}

const actions = defineActions({
  async getSigner(context): Promise<Signer> {
    const { state } = accountActionContext(context);
    const defaultAddress = api.formatAddress(state.address, false);
    const { signer } = await getWalletSigner(defaultAddress, state.source as AppWallet);

    return signer;
  },

  async afterLogin(context): Promise<void> {
    const { dispatch } = accountActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    await dispatch.subscribeOnAccountAssets();
    await rootDispatch.wallet.transactions.subscribeOnExternalHistory();
    await rootDispatch.wallet.router.checkCurrentRoute();
  },

  async logout(context, forgetAccount?: boolean): Promise<void> {
    const { commit, dispatch, state } = accountActionContext(context);
    const { rootDispatch, rootCommit } = rootActionContext(context);

    logoutApi(!state.isDesktop || forgetAccount);

    commit.resetAccountAssetsSubscription();
    rootCommit.wallet.transactions.resetExternalHistorySubscription();
    commit.resetAccount();

    if (state.isDesktop && forgetAccount) {
      await dispatch.getImportedAccounts();
    }

    await rootDispatch.wallet.router.checkCurrentRoute();
  },

  async checkAccountConnection(context): Promise<void> {
    const { dispatch, getters, state } = accountActionContext(context);

    if (getters.isLoggedIn) {
      try {
        if (state.isExternal) {
          const signer = await dispatch.getSigner();

          api.setSigner(signer);
        }

        await dispatch.afterLogin();
      } catch (error) {
        console.error(error);
        await dispatch.logout();
      }
    }
  },

  async updateAccountsList(context, accounts: Array<PolkadotJsAccount>): Promise<void> {
    const { commit, getters, dispatch, state } = accountActionContext(context);

    commit.setWalletAccounts(accounts);

    if (getters.isLoggedIn && state.isExternal) {
      try {
        await dispatch.getSigner();
      } catch (error) {
        await dispatch.logout();
      }
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
    const { dispatch, getters, state } = accountActionContext(context);
    try {
      if (state.selectedWallet) {
        await getWallet(state.selectedWallet);
      }
    } catch (error) {
      console.error(error);

      if (getters.isLoggedIn) {
        await dispatch.logout();
      }
    }
  },

  async selectWallet(context, extension: AppWallet) {
    const { commit, dispatch } = accountActionContext(context);

    commit.resetWalletAccountsSubscription();

    await getWallet(extension);

    commit.setSelectedWallet(extension);

    await dispatch.subscribeToWalletAccounts();
  },

  async subscribeOnWalletAvailability(context): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);

    const runChecks = async () =>
      await Promise.all([dispatch.updateAvailableWallets(), dispatch.checkSelectedWallet()]);

    await runChecks();

    const timer = setInterval(runChecks, CHECK_EXTENSION_INTERVAL);

    commit.setWalletAvailabilitySubscription(timer);
  },

  async getImportedAccounts(context) {
    const { dispatch } = accountActionContext(context);
    const accounts = await getImportedAccounts();
    await dispatch.updateAccountsList(accounts);
  },

  async subscribeToWalletAccounts(context): Promise<void> {
    const { commit, dispatch, state } = accountActionContext(context);

    if (!state.selectedWallet) return;

    const subscription = await subscribeToWalletAccounts(state.selectedWallet, (accounts) => {
      dispatch.updateAccountsList(accounts);
    });

    commit.setWalletAccountsSubscription(subscription);
  },

  async loginAccount(context, accountData: PolkadotJsAccount): Promise<void> {
    const { commit, dispatch, getters, state } = accountActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    if (!getters.isConnectedAccount(accountData)) {
      // Desktop has not source
      const source = (accountData.source as AppWallet) || '';
      const isExternal = !isInternalSource(source);
      // Don't forget account on Desktop
      logoutApi(!state.isDesktop);

      const defaultAddress = api.formatAddress(accountData.address, false);

      let account!: PolkadotJsAccount | undefined;

      if (isExternal) {
        const walletData = await getWalletSigner(defaultAddress, source);
        account = walletData.account;
        api.setSigner(walletData.signer);
      } else {
        account = state.polkadotJsAccounts.find((acc) => acc.address === defaultAddress);

        if (!account) {
          throw new Error('polkadotjs.noAccount');
        }
      }

      api.loginAccount(account.address, account.name, source, isExternal);

      commit.selectWalletAccount({ name: account.name, source });

      await dispatch.afterLogin();
    } else {
      await rootDispatch.wallet.router.checkCurrentRoute();
    }
  },

  /**
   * Desktop
   */
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
      exportAccountJson(JSON.stringify(json));
    }

    if (saveAccount) {
      api.addAccountPair(pair, password);
      // update account list in state
      if (state.isDesktop) {
        await dispatch.getImportedAccounts();
      }
    }

    return json;
  },

  /**
   * Desktop
   */
  async renameAccount(context, name: string) {
    const { commit, dispatch, state } = accountActionContext(context);
    // change name in api & storage
    api.changeAccountName(name);
    // update account data from storage
    commit.syncWithStorage();
    // update account list in state
    if (state.isDesktop) {
      await dispatch.getImportedAccounts();
    }
  },

  /**
   * Desktop
   */
  async restoreAccountFromJson(context, { json, password }: { json: KeyringPair$Json; password: string }) {
    const { dispatch, state } = accountActionContext(context);
    // restore from json file
    api.restoreAccountFromJson(json, password);
    // update account list in state
    if (state.isDesktop) {
      await dispatch.getImportedAccounts();
    }
  },

  /**
   * Desktop
   */
  exportAccount(_, password: string): void {
    const accountJson = api.exportAccount(api.accountPair, password);
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
    const { getters, commit, dispatch } = accountActionContext(context);
    try {
      const allAssets = await withTimeout(api.assets.getAssets(true, getters.whitelist, getters.blacklist));
      const allIds = allAssets.map((asset) => asset.address);
      const filtered = excludePoolXYKAssets(allAssets);

      commit.setAssetsIds(allIds);
      commit.updateAssets(filtered);
    } catch (error) {
      console.warn('Connection was lost during getAssets operation');
      await delay(UPDATE_ASSETS_INTERVAL);
      await dispatch.getAssets();
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
        commit.updateAssets([...state.assets, ...newFilteredAssets]);
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
          commit.updateAccountAssets(api.assets.accountAssets);
        });
        commit.setAccountAssetsSubscription(subscription);
        await api.assets.updateAccountAssets();
      } catch (error) {
        commit.updateAccountAssets([]);
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
  async subscribeOnFiatPrice(context): Promise<void> {
    const isSubqueryAvailable = await getFiatPriceObject(context);
    try {
      if (isSubqueryAvailable) {
        subscribeOnFiatUsingSubquery(context);
      } else {
        // Subscribe on CERES API anyway
        subscribeOnFiatUsingCeresApi(context);
      }
    } catch (error) {
      subscribeOnFiatUsingCeresApi(context, error as Error);
    }
  },

  async getAccountReferralRewards(context): Promise<void> {
    const { state, commit } = accountActionContext(context);
    commit.clearReferralRewards();
    const data = await SubqueryExplorerService.account.getReferralRewards(state.address);
    if (data) {
      commit.setReferralRewards(data);
    }
  },

  async notifyOnDeposit(context, data): Promise<void> {
    const { commit } = accountActionContext(context);
    const { asset, message }: { asset: WhitelistArrayItem; message: string } = data;
    pushNotification(asset, message);
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
