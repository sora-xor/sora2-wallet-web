import { defineActions } from 'direct-vuex';
import CryptoJS from 'crypto-js';
import cryptoRandomString from 'crypto-random-string';
import { axiosInstance } from '@sora-substrate/util';
import type { Signer } from '@polkadot/api/types';
import type { AccountAsset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

import { accountActionContext } from './../account';
import { rootActionContext } from '../../store';
import { api } from '../../api';
import { SubqueryExplorerService } from '../../services/subquery';
import {
  getAppWallets,
  getWallet,
  getExtensionSigner,
  getPolkadotJsAccounts,
  subscribeToPolkadotJsAccounts,
  WHITE_LIST_GITHUB_URL,
} from '../../util';
import { Extensions } from '../../consts';
import type { PolkadotJsAccount } from '../../types/common';
import { pushNotification } from '../../util/notification';

const UPDATE_PRICES_INTERVAL = 30 * 1000;
const CHECK_EXTENSION_INTERVAL = 5_000;
const PASSPHRASE_TIMEOUT = 15 * 60 * 1000; // 15min

const actions = defineActions({
  async getSigner(context): Promise<Signer> {
    const { state } = accountActionContext(context);
    const defaultAddress = api.formatAddress(state.address, false);
    const { signer } = await getExtensionSigner(defaultAddress, state.source as Extensions);

    return signer;
  },

  async afterLogin(context): Promise<void> {
    const { dispatch } = accountActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    await dispatch.subscribeOnAccountAssets();
    await rootDispatch.wallet.router.checkCurrentRoute();
  },

  async logout(context): Promise<void> {
    const { commit, getters } = accountActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    if (api.accountPair) {
      api.logout(!getters.isDesktop);
    }
    commit.resetAccountAssetsSubscription();
    commit.resetAccount();

    await rootDispatch.wallet.router.checkCurrentRoute();
  },

  async checkSigner(context): Promise<void> {
    const { dispatch, getters, state } = accountActionContext(context);

    if (getters.isLoggedIn) {
      try {
        const defaultAddress = api.formatAddress(state.address, false);
        const { signer } = await getExtensionSigner(defaultAddress, state.source as Extensions);

        api.setSigner(signer);

        await dispatch.afterLogin();
      } catch (error) {
        console.error(error);
        await dispatch.logout();
      }
    }
  },

  async updatePolkadotJsAccounts(context, accounts: Array<PolkadotJsAccount>): Promise<void> {
    const { commit, getters, dispatch } = accountActionContext(context);
    commit.setPolkadotJsAccounts(accounts);

    if (getters.isLoggedIn && !getters.isDesktop) {
      try {
        await dispatch.getSigner();
      } catch (error) {
        await dispatch.logout();
      }
    }
  },

  /**
   * Update the list of installed extensions
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

  async checkSelectedExtension(context): Promise<void> {
    const { dispatch, getters, state } = accountActionContext(context);
    try {
      if (state.selectedExtension) {
        await getWallet(state.selectedExtension);
      }
    } catch (error) {
      console.error(error);

      if (getters.isLoggedIn) {
        await dispatch.logout();
      }
    }
  },

  async selectExtension(context, extension: Extensions) {
    const { commit, dispatch } = accountActionContext(context);

    commit.resetPolkadotJsAccountsSubscription();

    await getWallet(extension);

    commit.setSelectedExtension(extension);

    await dispatch.subscribeToPolkadotJsAccounts();
  },

  async subscribeOnExtensionAvailability(context): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);

    const runChecks = async () =>
      await Promise.all([dispatch.updateAvailableWallets(), dispatch.checkSelectedExtension()]);

    await runChecks();

    const timer = setInterval(runChecks, CHECK_EXTENSION_INTERVAL);

    commit.setExtensionAvailabilitySubscription(timer);
  },
  async getPolkadotJsAccounts(context) {
    const accounts = await getPolkadotJsAccounts();
    const { dispatch } = accountActionContext(context);
    await dispatch.updatePolkadotJsAccounts(accounts);
  },
  async subscribeToPolkadotJsAccounts(context): Promise<void> {
    const { commit, dispatch, state } = accountActionContext(context);

    if (!state.selectedExtension) return;

    const subscription = await subscribeToPolkadotJsAccounts(state.selectedExtension, (accounts) => {
      dispatch.updatePolkadotJsAccounts(accounts);
    });

    commit.setPolkadotJsAccountsSubscription(subscription);
  },

  pullAccountsLocalStorage(context) {},

  async importPolkadotJs(context, accountData: PolkadotJsAccount): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);
    try {
      const source = accountData.source as Extensions;
      const defaultAddress = api.formatAddress(accountData.address, false);
      const { account, signer } = await getExtensionSigner(defaultAddress, source);

      const name = account.name || '';

      api.importByPolkadotJs(account.address, name, source);
      api.setSigner(signer);

      commit.selectPolkadotJsAccount({ name, source });

      await dispatch.afterLogin();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  },
  async importPolkadotJsDesktop(context, address: string) {
    const { getters, commit, dispatch } = accountActionContext(context);

    try {
      const defaultAddress = api.formatAddress(address, false);
      const account = getters.polkadotJsAccounts.find((acc) => acc.address === defaultAddress);

      if (!account) {
        throw new Error('polkadotjs.noAccount');
      }

      api.importByPolkadotJs(account.address, account.name, true);

      commit.selectPolkadotJsAccount(account.name);

      await dispatch.afterLogin();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  },
  async setAccountPassphrase(context, passphrase) {
    const key = cryptoRandomString({ length: 10, type: 'ascii-printable' });
    const passphraseEncoded = CryptoJS.AES.encrypt(passphrase, key).toString();

    const { commit } = accountActionContext(context);

    commit.updateAddressGeneratedKey(key);
    commit.setAccountPassphrase(passphraseEncoded);

    const timer = setTimeout(() => {
      commit.resetAccountPassphrase();
      clearTimeout(timer);
    }, PASSPHRASE_TIMEOUT);
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
        const account = { address: state.address, name: state.name, source: state.source as Extensions };
        await dispatch.importPolkadotJs(account);
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
      const assets = await api.assets.getAssets(getters.whitelist);
      commit.updateAssets(assets);
    } catch (error) {
      commit.updateAssets([]);
    }
  },
  async subscribeOnAssets(context): Promise<void> {
    const { commit, dispatch, getters } = accountActionContext(context);
    commit.resetAssetsSubscription();
    await dispatch.getAssets();

    const subscription = api.system.updated.subscribe((events) => {
      if (events.find((e) => e.event.section === 'assets' && e.event.method === 'AssetRegistered')) {
        dispatch.getAssets();
      }

      const notificationEvent = events.find((e) => e.event.section === 'assets' && e.event.method === 'Transfer');
      // 'to' address
      if (notificationEvent && notificationEvent.event.data[1].toJSON() === getters.account.address) {
        const assetAddress = (notificationEvent.event.data[2].toJSON() as any).code;
        const depositedAsset = getters.whitelist[assetAddress] as WhitelistArrayItem;
        commit.setAssetToNotify(depositedAsset);
      }
    });
    commit.setAssetsSubscription(subscription);
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
  async getWhitelist(context, whiteListOverApi: boolean): Promise<void> {
    const { commit } = accountActionContext(context);
    const url = whiteListOverApi ? WHITE_LIST_GITHUB_URL : '/whitelist.json';
    commit.clearWhitelist();
    try {
      const { data } = await axiosInstance.get(url);
      commit.setWhitelist(data);
    } catch (error) {
      commit.clearWhitelist();
    }
  },
  async getFiatPriceAndApyObject(context): Promise<void> {
    const { commit } = accountActionContext(context);
    try {
      const data = await SubqueryExplorerService.getFiatPriceAndApyObject();
      if (!data) {
        commit.clearFiatPriceAndApyObject();
        return;
      }
      commit.setFiatPriceAndApyObject(data);
    } catch (error) {
      commit.clearFiatPriceAndApyObject();
    }
  },
  async subscribeOnFiatPriceAndApyObjectUpdates(context): Promise<void> {
    const { dispatch, commit } = accountActionContext(context);
    dispatch.getFiatPriceAndApyObject();

    const timer = setInterval(() => {
      dispatch.getFiatPriceAndApyObject();
    }, UPDATE_PRICES_INTERVAL);
    commit.setFiatPriceAndApyTimer(timer);
  },
  async getAccountReferralRewards(context): Promise<void> {
    const { state, commit } = accountActionContext(context);
    commit.clearReferralRewards();
    try {
      const data = await SubqueryExplorerService.getAccountReferralRewards(state.address);
      if (!data) {
        commit.clearReferralRewards();
        return;
      }
      commit.setReferralRewards(data);
    } catch (error) {
      commit.clearReferralRewards();
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
    try {
      await api.transfer(asset, to, amount);
    } catch (error) {
      const e = error as Error;
      if (e.message.includes('Invalid decoded address')) {
        throw new Error('walletSend.errorAddress');
      }
      throw new Error(e.message);
    }
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
  async resetFiatPriceAndApySubscription(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.resetFiatPriceAndApySubscription();
  },
  /** It's used **only** for subscriptions module */
  async resetExtensionAvailabilitySubscription(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.resetExtensionAvailabilitySubscription();
  },
});

export default actions;
