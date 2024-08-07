import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../../api';
import { AppWallet, AccountActionTypes } from '../../consts';
import { GDriveWallet } from '../../services/google/wallet';
import { action, getter } from '../../store/decorators';
import { delay } from '../../util';
import { verifyAccountJson, exportAccountJson, exportAccount, deleteAccount } from '../../util/account';
import { settingsStorage } from '../../util/storage';

import LoadingMixin from './LoadingMixin';
import NotificationMixin from './NotificationMixin';

import type { PolkadotJsAccount } from '../../types/common';

@Component
export default class AccountActionsMixin extends Mixins(LoadingMixin, NotificationMixin) {
  @action.account.renameAccount private renameAccount!: (data: { address: string; name: string }) => Promise<void>;

  @action.account.logout private logoutAccount!: (forgetAddress?: string) => Promise<void>;

  @getter.account.isConnectedAccount public isConnectedAccount!: (account: PolkadotJsAccount) => boolean;

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
        this.logoutAccount();
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

        if (this.isConnectedAccount(this.selectedAccount)) {
          await this.renameAccount({ address, name });
        }

        this.accountRenameVisibility = false;
      });
    });
  }

  async handleAccountExport(password: string): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        if (!this.selectedAccount) return;

        const { address, source } = this.selectedAccount;

        if (source === AppWallet.GoogleDrive) {
          const json = await GDriveWallet.accounts.getAccount(address, password);

          if (!json) throw new Error('polkadotjs.noAccount');

          const verified = verifyAccountJson(api, json, password);

          exportAccountJson(verified);
        } else {
          exportAccount(api, { address, password });
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

        if (this.isConnectedAccount(this.selectedAccount)) {
          await this.logoutAccount();
        }

        if (this.selectedAccount.source === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.delete(this.selectedAccount.address);
        } else {
          deleteAccount(api, this.selectedAccount.address);
        }

        this.accountDeleteVisibility = false;
      });
    });
  }
}
