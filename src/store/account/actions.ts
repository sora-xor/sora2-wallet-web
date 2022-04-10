import { defineActions } from 'direct-vuex';
import { axiosInstance } from '@sora-substrate/util';
import type { Signer } from '@polkadot/api/types';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

import { accountActionContext } from './../account';
import { rootActionContext } from '../../store';
import { api } from '../../api';
import { SubqueryExplorerService } from '../../services/subquery';
import {
  getExtension,
  getExtensionInfo,
  getExtensionSigner,
  subscribeToPolkadotJsAccounts,
  WHITE_LIST_GITHUB_URL,
} from '../../util';
import type { PolkadotJsAccount } from '../../types/common';

const HOUR = 60 * 60 * 1000;
const CHECK_EXTENSION_INTERVAL = 5 * 1000;

const actions = defineActions({
  async getSigner(context): Promise<Signer> {
    const { state } = accountActionContext(context);
    const defaultAddress = api.formatAddress(state.address, false);
    const signer = await getExtensionSigner(defaultAddress);

    return signer;
  },
  async afterLogin(context): Promise<void> {
    const { dispatch } = accountActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    await dispatch.subscribeOnAccountAssets();
    await rootDispatch.wallet.router.checkCurrentRoute();
  },
  async logout(context): Promise<void> {
    const { commit } = accountActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    if (api.accountPair) {
      api.logout();
    }
    commit.resetAccountAssetsSubscription();
    commit.resetAccount();

    await rootDispatch.wallet.router.checkCurrentRoute();
  },
  async checkSigner(context): Promise<void> {
    const { dispatch, getters } = accountActionContext(context);
    if (getters.isLoggedIn) {
      try {
        const signer = await dispatch.getSigner();

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

    if (getters.isLoggedIn) {
      try {
        await dispatch.getSigner();
      } catch (error) {
        await dispatch.logout();
      }
    }
  },
  async checkExtension(context): Promise<void> {
    const { commit, dispatch, state, getters } = accountActionContext(context);
    try {
      await getExtension();
      commit.setExtensionAvailability(true);

      if (!state.polkadotJsAccountsSubscription) {
        await dispatch.subscribeToPolkadotJsAccounts();
      }
    } catch (error) {
      commit.setExtensionAvailability(false);
      commit.resetPolkadotJsAccountsSubscription();

      if (getters.isLoggedIn) {
        await dispatch.logout();
      }
    }
  },
  async subscribeOnExtensionAvailability(context): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);
    dispatch.checkExtension();

    const timer = setInterval(() => {
      dispatch.checkExtension();
    }, CHECK_EXTENSION_INTERVAL);
    commit.setExtensionAvailabilitySubscription(timer);
  },
  async subscribeToPolkadotJsAccounts(context): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);
    commit.resetPolkadotJsAccountsSubscription();

    const subscription = await subscribeToPolkadotJsAccounts(async (accounts) => {
      await dispatch.updatePolkadotJsAccounts(accounts);
    });
    commit.setPolkadotJsAccountsSubscription(subscription);
  },
  async importPolkadotJs(context, address: string): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);
    try {
      const defaultAddress = api.formatAddress(address, false);
      const info = await getExtensionInfo();
      const account = info.accounts.find((acc) => acc.address === defaultAddress);
      if (!account) {
        throw new Error('polkadotjs.noAccount');
      }
      api.importByPolkadotJs(account.address, account.name);
      api.setSigner(info.signer);

      commit.selectPolkadotJsAccount(account.name);

      await dispatch.afterLogin();
    } catch (error) {
      throw new Error((error as Error).message);
    }
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
        await dispatch.importPolkadotJs(state.address);
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
    const { commit, dispatch } = accountActionContext(context);
    commit.resetAssetsSubscription();
    await dispatch.getAssets();

    const subscription = api.system.updated.subscribe((events) => {
      if (events.find((e) => e.event.section === 'assets' && e.event.method === 'AssetRegistered')) {
        dispatch.getAssets();
      }
    });
    commit.setAssetsSubscription(subscription);
  },
  async subscribeOnAccountAssets(context): Promise<void> {
    const { commit, getters } = accountActionContext(context);
    commit.resetAccountAssetsSubscription();

    if (getters.isLoggedIn) {
      try {
        const subscription = api.assets.balanceUpdated.subscribe((data) => {
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
    }, HOUR);
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