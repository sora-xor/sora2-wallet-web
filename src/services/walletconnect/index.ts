import { WalletConnectInfo } from '../../consts/wallets';
import { addWalletLocally, checkWallet } from '../../util/account';

import { WcProvider } from './provider/base';
import { WcSubProvider } from './provider/substrate';
import { WcWallet } from './wallet';

import type { Wallet } from '@sora-test/wallet-connect/types';

export { WcProvider };

export const isWcWallet = (wallet: Wallet): boolean => {
  return wallet.extensionName.startsWith(WalletConnectInfo.extensionName);
};

const addWcWalletLocally = (
  chainId: string | number,
  onDisconnect: VoidFunction,
  Provider: typeof WcProvider
): string => {
  const name = chainId ? `${WalletConnectInfo.extensionName}:${chainId}` : WalletConnectInfo.extensionName;

  try {
    checkWallet(name as any);
  } catch {
    const provider = new Provider({
      chains: [chainId],
      onDisconnect,
    });
    const wallet = new WcWallet(provider);

    addWalletLocally(wallet, WalletConnectInfo, name);
  }

  return name;
};

export const addWcSubWalletLocally = (chainId: string, onDisconnect: VoidFunction): string => {
  return addWcWalletLocally(chainId, onDisconnect, WcSubProvider);
};
