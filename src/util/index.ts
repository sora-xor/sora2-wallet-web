import { web3Enable, web3FromAddress, web3AccountsSubscribe } from '@polkadot/extension-dapp';
import { FPNumber } from '@sora-substrate/util';
import { KnownAssets } from '@sora-substrate/util/build/assets/consts';
import type { RewardInfo, RewardsInfo } from '@sora-substrate/util/build/rewards/types';

import { api } from '../api';
import store from '../store';
import { ExplorerLink, SoraNetwork, ExplorerType } from '../consts';
import type { RewardsAmountHeaderItem } from '../types/rewards';
import type { PolkadotJsAccount } from '../types/common';

export const APP_NAME = 'Sora2 Wallet';

export const WHITE_LIST_GITHUB_URL =
  'https://raw.githubusercontent.com/sora-xor/polkaswap-exchange-web/develop/public/whitelist.json';

export const formatSoraAddress = (address: string) => api.formatAddress(address);

export const subscribeToPolkadotJsAccounts = async (
  callback: (accounts: PolkadotJsAccount[]) => void
): Promise<VoidFunction> => {
  const unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
    const polkadotJsAccounts = injectedAccounts.map((account) => ({
      address: account.address,
      name: account.meta.name || '',
    }));

    callback(polkadotJsAccounts);
  });

  return unsubscribe;
};

export const getExtension = async () => {
  let extensions: Array<any> = [];
  try {
    extensions = await web3Enable(APP_NAME);
  } catch (error) {
    throw new Error('polkadotjs.noExtensions');
  }
  if (!extensions.length) {
    throw new Error('polkadotjs.noExtensions');
  }
  return extensions[0];
};

export const getExtensionInfo = async () => {
  const extension = await getExtension();
  const accounts = (await extension.accounts.get()) as Array<{ address: string; name: string }>;
  if (!accounts.length) {
    throw new Error('polkadotjs.noAccounts');
  }
  return { accounts, signer: extension.signer };
};

export const getExtensionSigner = async (address: string) => {
  return (await web3FromAddress(address)).signer;
};

/**
 * Returns block explorer link according to appropriate network type.
 * @param soraNetwork
 * Devnet will set by default
 */
export const getExplorerLinks = (soraNetwork?: SoraNetwork): Array<ExplorerLink> => {
  switch (soraNetwork) {
    case SoraNetwork.Prod:
      return [
        { type: ExplorerType.Sorascan, value: 'https://sorascan.com/sora-mainnet' },
        { type: ExplorerType.Subscan, value: 'https://sora.subscan.io' },
      ];
    case SoraNetwork.Stage:
      return [{ type: ExplorerType.Sorascan, value: 'https://test.sorascan.com/sora-staging' }];
    case SoraNetwork.Test:
      return [{ type: ExplorerType.Sorascan, value: 'https://sorascan.tst.sora2.soramitsu.co.jp/sora-test' }];
    case SoraNetwork.Dev:
    default:
      return [{ type: ExplorerType.Sorascan, value: 'https://explorer.s2.dev.sora2.soramitsu.co.jp/sora-dev' }];
  }
};

export const copyToClipboard = async (text: string) => {
  try {
    return navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Could not copy text: ', err);
  }
};

export const formatAddress = (address: string, length = address.length / 2): string => {
  return `${address.slice(0, length / 2)}...${address.slice(-length / 2)}`;
};

export const getAssetIconStyles = (address: string) => {
  if (!address) {
    return {};
  }
  const asset = store.getters.whitelist[address];
  if (!asset) {
    return {};
  }
  return {
    'background-size': '100%',
    'background-image': `url("${asset.icon}")`,
  };
};

export const getStatusIcon = (status: string) => {
  // TODO: [1.5] we should check it
  switch (status) {
    case 'IN_PROGRESS':
      return 'refresh-16';
    case 'ERROR':
      return 'basic-clear-X-xs-24';
    case 'SUCCESS':
      return 'status-success-ic-16';
  }
  return '';
};

export const getStatusClass = (status: string) => {
  let state = '';
  switch (status) {
    case 'IN_PROGRESS':
      state = 'loading';
      break;
    case 'ERROR':
      state = 'error';
      break;
    case 'SUCCESS':
      state = 'success';
      break;
  }
  return state ? `info-status info-status--${state}` : 'info-status';
};

export const delay = async (ms = 50) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const toHashTable = (list: Array<any>, key: string) => {
  return list.reduce((result, item) => {
    if (!(key in item)) return result;

    return { ...result, [item[key]]: item };
  }, {});
};

export const shortenValue = (string: string, length = string.length / 2): string => {
  if (!string) return '';
  if (string.length < 35) return string;
  return `${string.slice(0, length / 2)}...${string.slice(-length / 2)}`;
};

export const groupRewardsByAssetsList = (rewards: Array<RewardInfo | RewardsInfo>): Array<RewardsAmountHeaderItem> => {
  const rewardsHash = rewards.reduce((result, item) => {
    const isRewardsInfo = 'rewards' in item;

    if (isRewardsInfo && !(item as RewardsInfo).rewards.length) return result;

    const { address, decimals } = isRewardsInfo ? (item as RewardsInfo).rewards[0].asset : (item as RewardInfo).asset;
    const amount = isRewardsInfo ? (item as RewardsInfo).limit : (item as RewardInfo).amount;
    const current = result[address] || FPNumber.ZERO;
    const addValue = FPNumber.fromCodecValue(amount, decimals);
    result[address] = current.add(addValue);
    return result;
  }, {});

  return Object.entries(rewardsHash).reduce((total: Array<RewardsAmountHeaderItem>, [address, amount]) => {
    if ((amount as FPNumber).isZero()) return total;

    const item = {
      asset: KnownAssets.get(address),
      amount: (amount as FPNumber).toString(),
    } as RewardsAmountHeaderItem;

    total.push(item);

    return total;
  }, []);
};
