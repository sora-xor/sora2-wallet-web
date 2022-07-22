import { getWallets, getWalletBySource } from '@subwallet/wallet-connect/dotsama/wallets';
import type { Wallet, WalletAccount } from '@subwallet/wallet-connect/types';
import type { Unsubcall } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';

import { FPNumber } from '@sora-substrate/util';
import { KnownAssets } from '@sora-substrate/util/build/assets/consts';

import type { RewardInfo, RewardsInfo } from '@sora-substrate/util/build/rewards/types';

import { api } from '../api';
import { ExplorerLink, SoraNetwork, ExplorerType, Extensions, TranslationConsts } from '../consts';
import type { PolkadotJsAccount } from '../types/common';
import type { RewardsAmountHeaderItem } from '../types/rewards';

export class AppError extends Error {
  public translationKey: string;
  public translationPayload: any;

  constructor({ key = '', payload = {} } = {}, ...params) {
    super(...params);
    this.name = 'AppHandledError';
    this.translationKey = key;
    this.translationPayload = payload;
  }
}

export const APP_NAME = 'Sora2 Wallet';

export const WHITE_LIST_GITHUB_URL =
  'https://raw.githubusercontent.com/sora-xor/polkaswap-exchange-web/develop/public/whitelist.json';

export const formatSoraAddress = (address: string) => api.formatAddress(address);

const formatWalletAccount = (account: WalletAccount): PolkadotJsAccount => ({
  address: account.address,
  name: account.name || '',
  source: account.source as Extensions,
});

const formatWalletAccounts = (accounts: Nullable<WalletAccount[]>): PolkadotJsAccount[] => {
  return (accounts || []).map((account) => formatWalletAccount(account));
};

export const subscribeToPolkadotJsAccounts = async (
  extension: Extensions,
  callback: (accounts: PolkadotJsAccount[]) => void
): Promise<Nullable<Unsubcall>> => {
  const wallet = await getWallet(extension);

  let resolveCall: VoidFunction;

  const subscriptionResult = new Promise<void>((resolve) => {
    resolveCall = resolve;
  });

  const unsubscribe = await wallet.subscribeAccounts((injectedAccounts) => {
    callback(formatWalletAccounts(injectedAccounts));
    resolveCall();
  });

  await subscriptionResult;

  return unsubscribe;
};

export const getAppWallets = (): Wallet[] => {
  try {
    return getWallets();
  } catch (error) {
    throw new AppError({ key: 'polkadotjs.noExtensions', payload: { polkadotJs: TranslationConsts.PolkadotJs } });
  }
};

export const getWalletByExtension = (extension: Extensions) => getWalletBySource(extension);

export const getWallet = async (extension = Extensions.PolkadotJS): Promise<Wallet> => {
  const wallet = getWalletByExtension(extension);

  if (!wallet) {
    throw new AppError({ key: 'polkadotjs.noExtension', payload: { extension } });
  }

  await wallet.enable();

  if (!wallet.signer) {
    throw new AppError({ key: 'polkadotjs.noSigner', payload: { extension } });
  }

  return wallet;
};

/**
 * Retrieves a provider for a specific address and return signer
 * @param address
 * @returns
 */
export const getExtensionSigner = async (address: string, extension: Extensions) => {
  const wallet = await getWallet(extension);
  const accounts = await wallet.getAccounts();

  if (!accounts) {
    throw new AppError({ key: 'polkadotjs.noAccounts', payload: { extension } });
  }

  const account = accounts.find((acc) => acc.address === address);

  if (!account) {
    throw new AppError({ key: 'polkadotjs.noAccount', payload: { extension } });
  }

  return { account: formatWalletAccount(account), signer: wallet.signer as Signer };
};

/**
 * Returns block explorer link according to appropriate network type.
 * @param soraNetwork
 * Devnet will set by default
 */
export const getExplorerLinks = (soraNetwork?: Nullable<SoraNetwork>): Array<ExplorerLink> => {
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

export const getCssVariableValue = (name: string): string => {
  return getComputedStyle(document.documentElement as any)
    .getPropertyValue(name)
    .trim();
};

export const getScrollbarWidth = (): number => {
  const outer = document.createElement('div');
  outer.className = 'el-scrollbar__wrap';
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  (outer.parentNode as HTMLElement).removeChild(outer);
  const scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
};
