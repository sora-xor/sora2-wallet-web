import { defineActions } from 'direct-vuex';
import type { Signer } from '@polkadot/api/types';
import type { AccountAsset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

import { accountActionContext } from './../account';
import { rootActionContext } from '../../store';
import { api } from '../../api';
import { SubqueryExplorerService } from '../../services/subquery';
import { incomingTransferFilter } from '../../services/subquery/queries/historyElements';
import {
  getAppWallets,
  getWallet,
  getExtensionSigner,
  subscribeToPolkadotJsAccounts,
  WHITE_LIST_URL,
  NFT_BLACK_LIST_URL,
} from '../../util';
import { Extensions, BLOCK_PRODUCE_TIME } from '../../consts';
import type { HistoryElementTransfer, FiatPriceAndApyObject } from '../../services/subquery/types';
import type { PolkadotJsAccount } from '../../types/common';
import { pushNotification } from '../../util/notification';

const CHECK_EXTENSION_INTERVAL = 5 * 1000;
const UPDATE_ASSETS_INTERVAL = BLOCK_PRODUCE_TIME * 3;
const CHECK_INCOMING_TRANSFERS_INTERVAL = BLOCK_PRODUCE_TIME * 3;

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
    await dispatch.subscribeOnIncomingTransfers();
    await rootDispatch.wallet.router.checkCurrentRoute();
  },

  async logout(context): Promise<void> {
    const { commit } = accountActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    if (api.accountPair) {
      api.logout();
    }
    commit.resetAccountAssetsSubscription();
    commit.resetIncomingTransfersSubscription();
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

    if (getters.isLoggedIn) {
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

  async subscribeToPolkadotJsAccounts(context): Promise<void> {
    const { commit, dispatch, state } = accountActionContext(context);

    if (!state.selectedExtension) return;

    const subscription = await subscribeToPolkadotJsAccounts(state.selectedExtension, (accounts) => {
      dispatch.updatePolkadotJsAccounts(accounts);
    });

    commit.setPolkadotJsAccountsSubscription(subscription);
  },

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
      const assets = await api.assets.getAssets(getters.whitelist, false, getters.blacklist);
      commit.updateAssets(assets);
    } catch (error) {
      commit.updateAssets([]);
    }
  },

  async subscribeOnAssets(context): Promise<void> {
    const { commit, dispatch } = accountActionContext(context);

    await dispatch.getAssets();

    const timer = setInterval(() => {
      dispatch.getAssets();
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
      const response = await fetch(WHITE_LIST_URL);
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
      const response = await fetch(NFT_BLACK_LIST_URL);
      const data = await response.json();
      commit.setNftBlacklist(data);
    } catch (error) {
      commit.clearBlacklist();
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
  async updateFiatPriceAndApyObject(context, fiatPriceAndApyRecord: FiatPriceAndApyObject): Promise<void> {
    const {
      commit,
      state: { fiatPriceAndApyObject },
    } = accountActionContext(context);

    const updated = { ...(fiatPriceAndApyObject || {}), ...fiatPriceAndApyRecord };

    commit.setFiatPriceAndApyObject(updated);
  },
  async subscribeOnFiatPriceAndApy(context): Promise<void> {
    const { dispatch, commit } = accountActionContext(context);

    await dispatch.getFiatPriceAndApyObject();

    const subscription = SubqueryExplorerService.createFiatPriceAndApySubscription(
      dispatch.updateFiatPriceAndApyObject
    );

    commit.setFiatPriceAndApySubscription(subscription);
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

  async subscribeOnIncomingTransfers(context): Promise<void> {
    const { commit, getters, state } = accountActionContext(context);

    commit.resetIncomingTransfersSubscription();

    if (!getters.isLoggedIn) return;

    let timestamp = Math.ceil(Date.now() / 1000);

    const timer = setInterval(async () => {
      const filter = incomingTransferFilter(state.address, timestamp);
      const variables = { filter };

      try {
        const data = await SubqueryExplorerService.getAccountTransactions(variables);

        if (!data || !Array.isArray(data.edges) || !data.edges.length) return;

        timestamp = +data.edges[0].node.timestamp;

        const assetAddresses = data.edges.reduce<string[]>((buffer, edge) => {
          if (!edge.node || !edge.node.data) return buffer;

          const assetId = (edge.node.data as HistoryElementTransfer).assetId;

          return [...buffer, assetId];
        }, []);
        const uniqueAssetAddresses = new Set<string>(assetAddresses);
        const assets = [...uniqueAssetAddresses].map(
          (assetAddress) => getters.whitelist[assetAddress] as WhitelistArrayItem
        );

        assets.forEach((asset) => {
          commit.setAssetToNotify(asset);
        });
      } catch (error) {
        console.error(error);
      }
    }, CHECK_INCOMING_TRANSFERS_INTERVAL);

    commit.setIncomingTransfersSubscription(timer);
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
  async resetIncomingTransfersSubscription(context): Promise<void> {
    const { commit } = accountActionContext(context);
    commit.resetIncomingTransfersSubscription();
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
