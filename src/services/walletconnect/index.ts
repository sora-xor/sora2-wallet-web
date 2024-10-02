import { api } from '../../api';
import { TranslationConsts } from '../../consts';
import { WalletConnectInfo } from '../../consts/wallets';
import { addWalletLocally, checkWallet } from '../../util/account';

import { WcProvider } from './provider/base';
import { WcSubProvider } from './provider/substrate';
import { WcWallet } from './wallet';

import type { WithKeyring } from '@sora-substrate/sdk';
import type { Wallet } from '@sora-test/wallet-connect/types';

export { WcProvider };

export const isWcWallet = (wallet: Wallet): boolean => {
  return wallet.extensionName.startsWith(WalletConnectInfo.extensionName);
};

const addWcWalletLocally = (
  chainId: string | number,
  onDisconnect: (source: string) => void,
  Provider: typeof WcProvider,
  isSingletone = false
): string => {
  const dAppName = TranslationConsts.Polkaswap;
  const walletName =
    !isSingletone && chainId ? `${WalletConnectInfo.extensionName}:${chainId}` : WalletConnectInfo.extensionName;

  try {
    checkWallet(walletName as any);
  } catch {
    const provider = new Provider({
      chains: [chainId],
      onDisconnect: () => onDisconnect(walletName),
    });
    const wallet = new WcWallet(provider);

    addWalletLocally(wallet, WalletConnectInfo, dAppName, walletName);
  }

  return walletName;
};

export const addWcSubWalletLocally = (chainApi: WithKeyring, onDisconnect: (source: string) => void): string => {
  if (!WcProvider.projectId) return '';

  const isSingletone = api === chainApi; // SORA wc wallet
  const chainGenesisHash = chainApi.api?.genesisHash.toString();

  if (chainGenesisHash) {
    return addWcWalletLocally(chainGenesisHash, onDisconnect, WcSubProvider, isSingletone);
  } else {
    return '';
  }
};
