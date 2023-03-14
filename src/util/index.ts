import { getWallets, getWalletBySource, addWallet } from '@subwallet/wallet-connect/dotsama/wallets';
import type { Wallet, WalletAccount } from '@subwallet/wallet-connect/types';
import type { Unsubcall } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';

import { FPNumber } from '@sora-substrate/util';
import { KnownAssets } from '@sora-substrate/util/build/assets/consts';

import type { RewardInfo, RewardsInfo } from '@sora-substrate/util/build/rewards/types';

import { api, connection } from '../api';
import {
  ExplorerLink,
  SoraNetwork,
  ExplorerType,
  LoginStep,
  AppWallet,
  AccountImportInternalFlow,
  AccountImportExternalFlow,
  AccountCreateFlow,
} from '../consts';
import { FearlessWalletInfo, isInternalWallet } from '../consts/wallets';
import type { RewardsAmountHeaderItem } from '../types/rewards';
import type { KeyringPair$Json, PolkadotJsAccount } from '../types/common';

export class AppError extends Error {
  public key: string;
  public payload: any;

  constructor({ key = '', payload = {} } = {}, ...params) {
    super(...params);
    this.name = 'AppHandledError';
    this.key = key;
    this.payload = payload;
  }
}

export const APP_NAME = 'Sora2 Wallet';

export const WHITE_LIST_URL = 'https://whitelist.polkaswap2.io/whitelist.json';
export const NFT_BLACK_LIST_URL = 'https://whitelist.polkaswap2.io/blacklist.json';

export function waitForDocumentReady() {
  return new Promise<void>((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      const callback = () => {
        window.removeEventListener('load', callback);
        resolve();
      };

      window.addEventListener('load', callback);
    }
  });
}

export const formatSoraAddress = (address: string) => api.formatAddress(address);

export const getImportedAccounts = async (): Promise<PolkadotJsAccount[]> => {
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
  source: account.source as AppWallet,
});

const formatWalletAccounts = (accounts: Nullable<WalletAccount[]>): PolkadotJsAccount[] => {
  return (accounts || []).map((account) => formatWalletAccount(account));
};

export const subscribeToWalletAccounts = async (
  wallet: AppWallet,
  callback: (accounts: PolkadotJsAccount[]) => void
): Promise<Nullable<Unsubcall>> => {
  const appWallet = await getWallet(wallet);

  let resolveCall: VoidFunction;

  const subscriptionResult = new Promise<void>((resolve) => {
    resolveCall = resolve;
  });

  const unsubscribe = await appWallet.subscribeAccounts((injectedAccounts) => {
    callback(formatWalletAccounts(injectedAccounts));
    resolveCall();
  });

  await subscriptionResult;
  // [TODO]: research why unsubscribe not works with extensions
  return unsubscribe;
};

export const addFearlessWalletLocally = () => {
  if (!getWalletBySource(FearlessWalletInfo.extensionName)) {
    addWallet(FearlessWalletInfo);
  }
};

export const getAppWallets = (): Wallet[] => {
  try {
    const wallets = getWallets().sort((a, b) => {
      if (a.extensionName === AppWallet.FearlessWallet) {
        return -1;
      }
      if (b.extensionName === AppWallet.FearlessWallet) {
        return 1;
      }
      return 0;
    });

    return wallets;
  } catch (error) {
    throw new AppError({ key: 'polkadotjs.noExtensions' });
  }
};

export const getWallet = async (extension = AppWallet.PolkadotJS): Promise<Wallet> => {
  const wallet = getWalletBySource(extension);

  if (!wallet) {
    // we haven't wallet data, so extension key used in translation
    throw new AppError({ key: 'polkadotjs.noExtension', payload: { extension } });
  }

  await waitForDocumentReady();

  await wallet.enable();

  if (typeof wallet.signer !== 'object') {
    const key = isInternalWallet(wallet) ? 'polkadotjs.connectionError' : 'polkadotjs.noSigner';

    throw new AppError({ key, payload: { extension: wallet.title } });
  }

  return wallet;
};

/**
 * Retrieves a provider for a specific address and return signer
 * @param address
 * @returns
 */
export const getWalletSigner = async (address: string, appWallet: AppWallet) => {
  const wallet = await getWallet(appWallet);
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
      case AppWallet.FearlessWallet:
        return 'https://chrome.google.com/webstore/detail/fearless-wallet/nhlnehondigmgckngjomcpcefcdplmgc';
      case AppWallet.SubwalletJS:
        return 'https://addons.mozilla.org/firefox/addon/subwallet/';
      case AppWallet.TalismanJS:
        return 'https://addons.mozilla.org/firefox/addon/talisman-wallet-extension/';
      case AppWallet.PolkadotJS:
        return 'https://addons.mozilla.org/firefox/addon/polkadot-js-extension/';
      default:
        return '';
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
  // SORAScan
  // PROD { type: ExplorerType.Sorascan, value: 'https://sorascan.com/sora-mainnet' },
  // STAGE { type: ExplorerType.Sorascan, value: 'https://test.sorascan.com/sora-staging' }
  // TEST { type: ExplorerType.Sorascan, value: 'https://sorascan.tst.sora2.soramitsu.co.jp/sora-test' }
  // DEV { type: ExplorerType.Sorascan, value: 'https://explorer.s2.dev.sora2.soramitsu.co.jp/sora-dev' }
  const links: Array<ExplorerLink> = [];
  if (soraNetwork === SoraNetwork.Prod) {
    links.push({ type: ExplorerType.Subscan, value: 'https://sora.subscan.io' });
  }
  return [
    ...links,
    {
      type: ExplorerType.Polkadot,
      value: `https://polkadot.js.org/apps/?rpc=${connection.endpoint}#/explorer/query`,
    },
  ];
};

export async function checkDevicesAvailability(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices.some((device) => device.kind === 'videoinput');
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function checkCameraPermission(): Promise<string> {
  try {
    const { state } = await navigator.permissions.query({ name: 'camera' } as any);

    return state;
  } catch (error) {
    console.error(error);
    return '';
  }
}

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

export const formatStringNumber = (value: Nullable<string>) => (value ? new FPNumber(value) : FPNumber.ZERO);

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
  for (const flow of [AccountCreateFlow, AccountImportInternalFlow, AccountImportExternalFlow]) {
    const currentStepIndex = flow.findIndex((stepValue) => stepValue === currentStep);

    if (currentStepIndex > 0) {
      return flow[currentStepIndex - 1];
    }
  }

  return LoginStep.AccountList;
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
