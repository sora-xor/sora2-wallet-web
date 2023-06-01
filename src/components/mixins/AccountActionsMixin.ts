import { Component, Mixins } from 'vue-property-decorator';

import { AppWallet, AccountActionTypes } from '../../consts';
import { GDriveWallet } from '../../services/google/wallet';
import { action, getter } from '../../store/decorators';
import { delay } from '../../util';
import { settingsStorage } from '../../util/storage';

import LoadingMixin from './LoadingMixin';
import NotificationMixin from './NotificationMixin';

import type { PolkadotJsAccount, KeyringPair$Json } from '../../types/common';

@Component
export default class AccountActionsMixin extends Mixins(LoadingMixin, NotificationMixin) {
  @action.account.renameAccount private renameAccount!: (data: { address: string; name: string }) => Promise<void>;
  @action.account.exportAccount private exportAccount!: (data: { address: string; password: string }) => Promise<void>;
  @action.account.exportAccountFromJson private exportAccountFromJson!: (data: {
    json: KeyringPair$Json;
    password: string;
  }) => Promise<void>;

  @action.account.logout private logout!: (forgetAddress?: string) => Promise<void>;

  @getter.account.isConnectedAccount private isConnectedAccount!: (account: PolkadotJsAccount) => boolean;

  accountRenameVisibility = false;
  accountExportVisibility = false;
  accountDeleteVisibility = false;

  selectedAccount: Nullable<PolkadotJsAccount> = null;

  handleAccountAction(actionType: string, account: PolkadotJsAccount): void {
    this.selectedAccount = { ...account };

    switch (actionType) {
      case AccountActionTypes.Rename: {
        this.accountRenameVisibility = true;
        break;
      }
      case AccountActionTypes.Export: {
        this.accountExportVisibility = true;
        break;
      }
      case AccountActionTypes.Logout: {
        this.logout();
        break;
      }
      case AccountActionTypes.Delete: {
        const storageValue = settingsStorage.get('allowAccountDeletePopup');
        const popupVisibility = storageValue ? Boolean(JSON.parse(storageValue)) : true;

        if (popupVisibility) {
          this.accountDeleteVisibility = true;
        } else {
          this.handleAccountDelete();
        }
        break;
      }
    }
  }

  async handleAccountRename(name: string): Promise<void> {
    await this.withLoading(async () => {
      await this.withAppNotification(async () => {
        if (!this.selectedAccount) return;

        const { address, source } = this.selectedAccount;

        if (source === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.changeName(address, name);
        }

        if (this.isConnectedAccount(this.selectedAccount) || !source) {
          await this.renameAccount({ address, name });
        }

        this.accountRenameVisibility = false;
      });
    });
  }

  async handleAccountExport({ password }: { password: string }): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        if (!this.selectedAccount) return;

        const { address, source } = this.selectedAccount;

        if (source === AppWallet.GoogleDrive) {
          const json = await GDriveWallet.accounts.getAccount(address);

          if (!json) throw new Error('polkadotjs.noAccount');

          await this.exportAccountFromJson({ json, password });
        } else {
          await this.exportAccount({ address, password });
        }

        this.accountExportVisibility = false;
      });
    });
  }

  async handleAccountDelete(allowAccountDeletePopup = true): Promise<void> {
    await this.withLoading(async () => {
      await this.withAppNotification(async () => {
        if (!this.selectedAccount) return;

        if (!allowAccountDeletePopup) {
          settingsStorage.set('allowAccountDeletePopup', false);
        }

        if (this.selectedAccount.source === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.delete(this.selectedAccount.address);
        }

        await this.logout(this.selectedAccount.address);

        this.accountDeleteVisibility = false;
      });
    });
  }
}
