import { WalletConnectInfo } from '../../consts/wallets';
import { addWalletLocally, checkWallet } from '../../util/account';

import { WcProvider } from './provider/base';
import { WcSubstrateProvider } from './provider/substrate';
import { WcSubstrateWallet } from './wallet';

import type { Wallet } from '@sora-test/wallet-connect/types';

export { WcProvider, WcSubstrateProvider, WcSubstrateWallet };

export const isWcWallet = (wallet: Wallet): boolean => {
  return wallet.extensionName.startsWith(WalletConnectInfo.extensionName);
};

export const addWcWalletLocally = (chainId: string): string => {
  const name = chainId ? `${WalletConnectInfo.extensionName}:${chainId}` : WalletConnectInfo.extensionName;

  try {
    checkWallet(name as any);
  } catch {
    const provider = new WcSubstrateProvider([chainId]);
    const wallet = new WcSubstrateWallet(provider);

    addWalletLocally(wallet, WalletConnectInfo, name);
  }

  return name;
};
