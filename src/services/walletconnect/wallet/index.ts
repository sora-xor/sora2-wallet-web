import { WalletConnectInfo } from '../../../consts/wallets';

class WalletConnectSubstrateWallet {
  public readonly version = '0.0.1';
  public readonly name = WalletConnectInfo.extensionName;

  private access!: boolean;
  private wcProvider!: any;

  // public readonly accounts!: Accounts;

  constructor(wcProvider: WalletConnectSubstrateProvider) {
    this.wcProvider = wcProvider;
    // this.accounts = new Accounts();
    this.access = false;
  }

  async enable() {
    try {
      await this.wcProvider.auth();
      this.access = true;
    } catch {
      this.access = false;
    }

    return {
      version: this.version,
      name: this.name,
      accounts: this.accounts,
      provider: undefined,
      signer: this.access ? null : undefined,
      metadata: undefined,
    };
  }
}
