import { WalletConnectInfo } from '../../../consts/wallets';
import { addWalletLocally, checkWallet } from '../../../util/account';
import { WcSubstrateProvider } from '../provider';

import WcAccounts from './accounts';
import WcSigner from './signer';

import type { InjectedWindowProvider, Injected } from '@polkadot/extension-inject/types';

export class WcSubstrateWallet implements InjectedWindowProvider {
  public static readonly version = '0.0.1';

  private wcProvider!: WcSubstrateProvider;

  public readonly accounts!: WcAccounts;
  public readonly signer!: WcSigner;

  constructor(wcProvider: WcSubstrateProvider) {
    this.wcProvider = wcProvider;
    this.accounts = new WcAccounts(this.wcProvider);
    this.signer = new WcSigner(this.wcProvider);
  }

  async enable(): Promise<Injected> {
    await this.wcProvider.enable();

    return {
      accounts: this.accounts,
      metadata: undefined,
      provider: undefined,
      signer: this.signer,
    };
  }
}

export const addWcWalletLocally = (chainId: string): void => {
  const name = `${WalletConnectInfo.extensionName}:${chainId}`;

  try {
    checkWallet(name as any);
  } catch {
    const provider = new WcSubstrateProvider(chainId);
    const wallet = new WcSubstrateWallet(provider);

    addWalletLocally(wallet, WalletConnectInfo, name);
  }
};
