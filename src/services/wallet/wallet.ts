import {
  InjectedAccount,
  InjectedExtension,
  InjectedMetadata,
  InjectedProvider,
  InjectedWindow,
} from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';

import { SubscriptionFn, Wallet, WalletAccount, WalletInfo, WalletLogoProps } from './types';

export class BaseDotSamaWallet implements Wallet {
  dAppName: string;

  extensionName: string;
  title: string;
  chromeUrl: string;
  mozillaUrl: string;
  installUrl: string;
  logo: WalletLogoProps;

  _extension: InjectedExtension | undefined;
  _signer: Signer | undefined;
  _metadata: InjectedMetadata | undefined;
  _provider: InjectedProvider | undefined;

  constructor({ extensionName, chromeUrl, mozillaUrl, logo, title }: WalletInfo, dAppName = 'dApp Connect') {
    this.extensionName = extensionName;
    this.title = title;
    this.chromeUrl = chromeUrl;
    this.mozillaUrl = mozillaUrl;
    this.installUrl = /firefox|fxios/i.test(navigator.userAgent) ? mozillaUrl : chromeUrl; // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.logo = logo;

    this.dAppName = dAppName;
  }

  // API docs: https://polkadot.js.org/docs/extension/
  get extension() {
    return this._extension;
  }

  // API docs: https://polkadot.js.org/docs/extension/
  get signer() {
    return this._signer;
  }

  get metadata() {
    return this._metadata;
  }

  get provider() {
    return this._provider;
  }

  get installed() {
    const injectedWindow = window as Window & InjectedWindow;
    const injectedExtension = injectedWindow?.injectedWeb3?.[this.extensionName];

    return !!injectedExtension;
  }

  get rawExtension() {
    const injectedWindow = window as Window & InjectedWindow;

    return injectedWindow?.injectedWeb3?.[this.extensionName];
  }

  enable = async () => {
    if (!this.installed) {
      return;
    }

    try {
      const injectedExtension = this.rawExtension;

      if (!injectedExtension?.enable) {
        return;
      }

      const rawExtension = await injectedExtension.enable(this.dAppName);

      if (!rawExtension) {
        return;
      }

      const extension: InjectedExtension = {
        ...rawExtension,
        // Manually add `InjectedExtensionInfo` so as to have a consistent response.
        name: this.extensionName,
        version: injectedExtension.version ?? 'unknown',
      };

      this._extension = extension;
      this._signer = extension?.signer;
      this._metadata = extension?.metadata;
      this._provider = extension?.provider;
    } catch (err) {
      console.error(err);
    }
  };

  private generateWalletAccount = (account: InjectedAccount): WalletAccount => {
    return {
      ...account,
      source: this._extension?.name as string,
      // Added extra fields here for convenience
      wallet: this,
      signer: this._extension?.signer,
    } as WalletAccount;
  };

  subscribeAccounts = async (callback: SubscriptionFn) => {
    if (!this._extension) {
      await this?.enable();
    }

    if (!this._extension) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callback(undefined);

      return null;
    }

    return this._extension.accounts.subscribe((accounts: InjectedAccount[]) => {
      const accountsWithWallet = accounts.map(this.generateWalletAccount);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callback(accountsWithWallet);
    });
  };

  getAccounts = async () => {
    if (!this._extension) {
      await this?.enable();
    }

    if (!this._extension) {
      return null;
    }

    const accounts = await this._extension.accounts.get();

    return accounts.map(this.generateWalletAccount);
  };
}
