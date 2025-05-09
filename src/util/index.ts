import { FPNumber } from '@sora-substrate/sdk';
import { KnownAssets, NativeAssets } from '@sora-substrate/sdk/build/assets/consts';

import { api, connection } from '../api';
import {
  ExplorerLink,
  SoraNetwork,
  ExplorerType,
  syntheticAssetRegexp,
  kensetsuAssetRegexp,
  CeresAddresses,
} from '../consts';
import { Currencies } from '../consts/currencies';
import { FilterOptions } from '../types/common';

import type { AccountIdentity } from '../types/common';
import type { Currency } from '../types/currency';
import type { RewardsAmountHeaderItem } from '../types/rewards';
import type { WithKeyring, WithConnectionApi } from '@sora-substrate/sdk';
import type { Asset } from '@sora-substrate/sdk/build/assets/types';
import type { RewardInfo, RewardsInfo } from '@sora-substrate/sdk/build/rewards/types';
import type { Store } from 'vuex';

export class AppError extends Error {
  public key: string;
  public payload: any;

  get message(): string {
    const { key, payload } = this;
    return JSON.stringify({ key, payload });
  }

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

export const validateAddress = (address: string): boolean => {
  return !!address && api.validateAddress(address);
};

export const formatAccountAddress = (address: string, withPrefix = true, chainApi: WithConnectionApi = api) => {
  try {
    return validateAddress(address) ? chainApi.formatAddress(address, withPrefix) : '';
  } catch {
    return '';
  }
};

export const getAccountIdentity = async (
  address: string,
  chainApi: WithConnectionApi = api
): Promise<AccountIdentity | null> => {
  if (!validateAddress(address)) return null;

  const identity = await chainApi.getAccountOnChainIdentity(address);

  if (!identity) return null;

  return {
    name: identity.displayName,
    legalName: identity.legalName,
    approved: identity.approved,
  };
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

export const getCurrency = (currencyName: Currency, currencies = Currencies) => {
  return currencies.find((currency) => currency.key === currencyName);
};

export const formatAddress = (address: string, length = address.length / 2): string => {
  if (address.length <= length) return address;

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

export const getCssVariableValue = (name: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

export const getTextWidth = (text: string, font = '300 12px "Sora", sans-serif'): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) return 0;

  context.font = font;

  const width = context.measureText(text).width.toFixed(1);

  return Number(width);
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

export async function beforeTransactionSign(
  store: Store<any>,
  signerApi: WithKeyring,
  mutationType = 'wallet/transactions/setSignTxDialogVisibility'
): Promise<void> {
  const { address, signer } = signerApi;

  if (!address || signer) return;

  const password = store.getters['wallet/account/getPassword'](address);
  const confirmDisabled = store.state.wallet.transactions.isSignTxDialogDisabled;

  if (password && confirmDisabled) {
    signerApi.unlockPair(password);
  } else {
    store.commit(mutationType, true);

    await new Promise<void>((resolve) => {
      const unsubscribe = store.subscribe((mutation) => {
        if (mutationType === mutation.type && mutation.payload === false) {
          unsubscribe();
          resolve();
        }
      });
    });
  }

  if (signerApi.accountPair?.isLocked) {
    throw new Error('Cancelled');
  }
}

export function getAssetsSubset<T extends Asset>(tokensList: T[], assetsFilter: FilterOptions): T[] {
  switch (assetsFilter) {
    case FilterOptions.Native: {
      const nativeAssetsAddresses = NativeAssets.map((nativeAsset) => nativeAsset.address);
      return tokensList.filter((asset) => nativeAssetsAddresses.includes(asset.address));
    }
    case FilterOptions.Kensetsu: {
      return tokensList.filter((asset) => kensetsuAssetRegexp.test(asset.address));
    }
    case FilterOptions.Synthetics: {
      return tokensList.filter((asset) => syntheticAssetRegexp.test(asset.address));
    }
    case FilterOptions.Ceres: {
      const ceresAssetsAddresses = CeresAddresses;
      return tokensList.filter((asset) => ceresAssetsAddresses.includes(asset.address));
    }
    default: {
      return tokensList;
    }
  }
}
