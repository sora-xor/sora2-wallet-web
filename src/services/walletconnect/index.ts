import { WalletConnectInfo } from '../../consts/wallets';
import { addWalletLocally, checkWallet } from '../../util/account';

import { WcSubstrateProvider } from './provider';
import { WcSubstrateWallet } from './wallet';

export { WcSubstrateProvider, WcSubstrateWallet };

export const addWcWalletLocally = (chainId: string): string => {
  const name = chainId ? `${WalletConnectInfo.extensionName}:${chainId}` : WalletConnectInfo.extensionName;

  try {
    checkWallet(name as any);
  } catch {
    const provider = new WcSubstrateProvider(chainId);
    const wallet = new WcSubstrateWallet(provider);

    addWalletLocally(wallet, WalletConnectInfo, name);
  }

  return name;
};
