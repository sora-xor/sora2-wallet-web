import { Singleton } from '../../../decorators';

import Accounts from './accounts';

import type { InjectedWindowProvider, Injected } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';
import type { WithKeyring } from '@sora-substrate/util';

@Singleton
export class SoraWallet implements InjectedWindowProvider {
  public static readonly version = '0.0.1';

  public readonly accounts!: Accounts;

  constructor(api: WithKeyring) {
    this.accounts = new Accounts(api);
  }

  private get signer(): Signer {
    return null as unknown as Signer;
  }

  async enable(): Promise<Injected> {
    return {
      accounts: this.accounts,
      metadata: undefined,
      provider: undefined,
      signer: this.signer,
    };
  }
}
