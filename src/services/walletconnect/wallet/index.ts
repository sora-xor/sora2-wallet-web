import WcAccounts from './accounts';
import WcSigner from './signer';

import type { WcSubstrateProvider } from '../provider';
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
