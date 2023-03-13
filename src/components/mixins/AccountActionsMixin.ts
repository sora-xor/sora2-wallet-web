import { Component, Mixins } from 'vue-property-decorator';

import LoadingMixin from './LoadingMixin';
import NotificationMixin from './NotificationMixin';

import { action } from '../../store/decorators';
import { delay } from '../../util';
import { settingsStorage } from '../../util/storage';
import { AppWallet, AccountActionTypes } from '../../consts';
import { GDriveWallet } from '../../services/google/wallet/wallet';

import type { PolkadotJsAccount } from '../../types/common';

@Component
export default class AccountActionsMixin extends Mixins(LoadingMixin, NotificationMixin) {
  @action.account.renameAccount private renameAccount!: (name: string) => Promise<void>;
  @action.account.exportAccount private exportAccount!: (password: string) => Promise<void>;
  @action.account.logout private logout!: (forgetAddress?: string) => Promise<void>;

  accountRenameVisibility = false;
  accountExportVisibility = false;
  accountDeleteVisibility = false;

  selectedAccount: Nullable<PolkadotJsAccount> = null;

  handleAccountAction(actionType: string, account: PolkadotJsAccount): void {
    console.log(actionType, account);
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

        if (this.selectedAccount.source === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.changeName(this.selectedAccount.address, name);
        }

        await this.renameAccount(name);
        this.accountRenameVisibility = false;
      });
    });
  }

  async handleAccountExport({ password }: { password: string }): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution
      await delay(500);

      await this.withAppNotification(async () => {
        await this.exportAccount(password);
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
