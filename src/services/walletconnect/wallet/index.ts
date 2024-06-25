import WcAccounts from './accounts';
import WcSigner from './signer';

import type { WcSubstrateProvider } from '../provider';
import type { InjectedWindowProvider, Injected } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';

export class WcSubstrateWallet implements InjectedWindowProvider {
  public static readonly version = '0.0.1';

  private access = false;
  private wcProvider!: WcSubstrateProvider;

  public readonly wcAccounts!: WcAccounts;
  public readonly wcSigner!: WcSigner;

  constructor(wcProvider: WcSubstrateProvider) {
    this.wcProvider = wcProvider;
    this.wcAccounts = new WcAccounts(this.wcProvider);
    this.wcSigner = new WcSigner(this.wcProvider);
  }

  private get signer(): Signer {
    return (this.access ? this.wcSigner : undefined) as unknown as Signer;
  }

  async enable(): Promise<Injected> {
    try {
      await this.wcProvider.enable();
      this.access = true;
    } catch {
      this.access = false;
    }

    return {
      accounts: this.wcAccounts,
      metadata: undefined,
      provider: undefined,
      signer: this.signer,
    };
  }
}
