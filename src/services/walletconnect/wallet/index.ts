import { WalletConnectInfo } from '../../../consts/wallets';
import { addWalletLocally, checkWallet } from '../../../util/account';
import { WcSubstrateProvider } from '../provider';

import Accounts from './accounts';

import type { InjectedWindowProvider, Injected } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';

export class WcSubstrateWallet implements InjectedWindowProvider {
  public static readonly version = '0.0.1';

  private access!: boolean;
  private wcProvider!: WcSubstrateProvider;

  public readonly accounts!: Accounts;

  constructor(wcProvider: WcSubstrateProvider) {
    this.wcProvider = wcProvider;
    this.accounts = new Accounts(this.wcProvider);
    this.access = false;
  }

  private get signer(): Signer {
    return (this.access ? null : undefined) as unknown as Signer;
  }

  async enable(): Promise<Injected> {
    try {
      await this.wcProvider.enable();
      this.access = true;
    } catch (error) {
      this.access = false;
      throw error;
    }

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
