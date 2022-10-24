import { getWallets, getWalletBySource } from '@subwallet/wallet-connect/dotsama/wallets';
import type { Wallet, WalletAccount } from '@subwallet/wallet-connect/types';
import type { Unsubcall } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';

import { FPNumber } from '@sora-substrate/util';
import { KnownAssets } from '@sora-substrate/util/build/assets/consts';

import type { RewardInfo, RewardsInfo } from '@sora-substrate/util/build/rewards/types';

import { api } from '../api';
import { ExplorerLink, SoraNetwork, ExplorerType, LoginStep, Extensions } from '../consts';
import type { RewardsAmountHeaderItem } from '../types/rewards';
import type { KeyringPair$Json, PolkadotJsAccount } from '../types/common';

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

export const WHITE_LIST_URL = 'https://whitelist.polkaswap2.io/whitelist.json';
export const NFT_BLACK_LIST_URL = 'https://whitelist.polkaswap2.io/blacklist.json';

export const formatSoraAddress = (address: string) => api.formatAddress(address);

export const getPolkadotJsAccounts = async (): Promise<any> => {
  const accounts = await api.getAccounts();
  const polkadotJsAccounts = accounts.map((account) => ({
    address: account.address,
    name: account.meta.name || '',
  }));
  return polkadotJsAccounts;
};

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
    const wallets = getWallets();

    return wallets;
  } catch (error) {
    throw new AppError({ key: 'polkadotjs.noExtensions', payload: { polkadotJs: TranslationConsts.PolkadotJs } });
  }
};

export const getWalletByExtension = (extension: Extensions) => getWalletBySource(extension);

export const getWallet = async (extension = Extensions.PolkadotJS): Promise<Wallet> => {
  const wallet = getWalletByExtension(extension);

  if (!wallet) {
    // we haven't wallet data, so extension key used in translation
    throw new AppError({ key: 'polkadotjs.noExtension', payload: { extension } });
  }

  await wallet.enable();

  if (!wallet.signer) {
    throw new AppError({ key: 'polkadotjs.noSigner', payload: { extension: wallet.title } });
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
    throw new AppError({ key: 'polkadotjs.noAccounts', payload: { extension: wallet.title } });
  }

  const account = accounts.find((acc) => acc.address === address);

  if (!account) {
    throw new AppError({ key: 'polkadotjs.noAccount', payload: { extension: wallet.title } });
  }

  return { account: formatWalletAccount(account), signer: wallet.signer as Signer };
};

/**
 * Get url to install wallet extension
 * Extensions are available for Chrome based browsers (Chrome, Edge, Brave) & Firefox
 * @param wallet wallet data
 * @returns browser extension install url
 */
export const getWalletInstallUrl = (wallet: Wallet): string => {
  const { extensionName, installUrl } = wallet;

  // for Firefox
  if (navigator.userAgent.match(/firefox|fxios/i)) {
    switch (extensionName) {
      case Extensions.SubwalletJS:
        return 'https://addons.mozilla.org/firefox/addon/subwallet/';
      case Extensions.TalismanJS:
        return 'https://addons.mozilla.org/firefox/addon/talisman-wallet-extension/';
      default:
        return 'https://addons.mozilla.org/firefox/addon/polkadot-js-extension/';
    }
  }

  // for Chrome based browsers
  return installUrl;
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

export const getPreviousLoginStep = (currentStep: LoginStep): LoginStep => {
  let currentStepIndex: number;

  if (currentStep === LoginStep.Welcome) return LoginStep.AccountList;

  const createFlow = [
    LoginStep.Welcome,
    LoginStep.SeedPhrase,
    LoginStep.ConfirmSeedPhrase,
    LoginStep.CreateCredentials,
  ] as Array<LoginStep>;

  currentStepIndex = createFlow.findIndex((stepValue) => stepValue === currentStep);

  if (currentStepIndex !== -1) {
    return createFlow[currentStepIndex - 1];
  }

  const importFlow = [LoginStep.Welcome, LoginStep.Import, LoginStep.ImportCredentials] as Array<LoginStep>;

  currentStepIndex = importFlow.findIndex((stepValue) => stepValue === currentStep);

  if (currentStepIndex !== -1) {
    return importFlow[currentStepIndex - 1];
  }

  return LoginStep.Welcome;
};

export const parseJson = (file: File): Promise<KeyringPair$Json> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const json = reader.result as string;
      resolve(JSON.parse(json));
    };
    reader.onerror = (e) => reject(e);
  });
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
