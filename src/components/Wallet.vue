<template>
  <wallet-base :title="headerTitle" :show-back="!!selectedTransaction" :reset-focus="headerTitle" @back="handleBack">
    <template v-if="!selectedTransaction" #actions>
      <s-button :type="isMultisig() ? 'primary' : 'tertiary'" @click="handleMST"> Multi-Sig </s-button>

      <s-button type="action" :tooltip="t('accountSettings.title')" @click="handleAccountSettings">
        <s-icon name="basic-settings-24" size="28" />
      </s-button>
      <s-button
        v-if="permissions.createAssets"
        type="action"
        :tooltip="t('createTokenText')"
        @click="handleCreateToken"
      >
        <s-icon name="various-atom-24" size="28" />
      </s-button>
    </template>

    <wallet-account v-if="!selectedTransaction">
      <qr-code-scan-button alternative @change="parseQrCodeValue" />

      <s-button
        type="action"
        size="small"
        alternative
        rounded
        :tooltip="t('code.receive')"
        @click="receiveByQrCode(null)"
      >
        <s-icon name="finance-receive-show-QR-24" size="24" />
      </s-button>

      <s-button
        type="action"
        size="small"
        alternative
        rounded
        :tooltip="t('account.switch')"
        @click="handleSwitchAccount"
      >
        <s-icon name="arrows-refresh-ccw-24" size="24" />
      </s-button>

      <account-actions-menu v-if="!isExternal" :actions="accountActions" @select="handleAccountActionType" />
    </wallet-account>

    <div v-show="!selectedTransaction" class="wallet">
      <s-tabs v-model="currentTab" type="rounded">
        <s-tab v-for="tab in WalletTabs" :key="tab" :label="t(`wallet.${tab}`)" :name="tab" />
      </s-tabs>
      <component :is="currentTab" @swap="handleSwap" />
    </div>

    <wallet-transaction-details v-if="selectedTransaction" />

    <account-settings-dialog :visible.sync="accountSettingsVisibility" />
    <mst-onboarding-dialog :visible.sync="mstOnboardingDialog" />
    <multisig-change-name-dialog :visible.sync="dialogMSTNameChange" />

    <template v-if="!isExternal">
      <account-rename-dialog
        :visible.sync="accountRenameVisibility"
        :loading="loading"
        @confirm="handleAccountRename"
      />
      <account-export-dialog
        :visible.sync="accountExportVisibility"
        :loading="loading"
        @confirm="handleAccountExport"
      />
      <account-delete-dialog
        :visible.sync="accountDeleteVisibility"
        :loading="loading"
        @confirm="handleAccountDelete"
      />
    </template>
  </wallet-base>
</template>

<script lang="ts">
import { api } from '@sora-substrate/sdk';
import { Component, Mixins } from 'vue-property-decorator';

import { RouteNames, WalletTabs, AccountActionTypes } from '../consts';
import { state, getter, mutation } from '../store/decorators';

import AccountActionsMenu from './Account/ActionsMenu.vue';
import AccountExportDialog from './Account/ConfirmDialog.vue';
import AccountDeleteDialog from './Account/DeleteDialog.vue';
import AccountRenameDialog from './Account/RenameDialog.vue';
import AccountSettingsDialog from './Account/SettingsDialog.vue';
import WalletAccount from './Account/WalletAccount.vue';
import AccountActionsMixin from './mixins/AccountActionsMixin';
import OperationsMixin from './mixins/OperationsMixin';
import QrCodeParserMixin from './mixins/QrCodeParserMixin';
import MstOnboardingDialog from './MST/MstOnboardingDialog.vue';
import MultisigChangeNameDialog from './MST/MultisigChangeNameDialog.vue';
import QrCodeScanButton from './QrCode/QrCodeScanButton.vue';
import WalletAssets from './WalletAssets.vue';
import WalletBase from './WalletBase.vue';
import WalletHistory from './WalletHistory.vue';
import WalletTransactionDetails from './WalletTransactionDetails.vue';

import type { WalletPermissions } from '../consts';
import type { HistoryItem } from '@sora-substrate/sdk';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    WalletAssets,
    WalletHistory,
    QrCodeScanButton,
    WalletTransactionDetails,
    AccountActionsMenu,
    AccountRenameDialog,
    AccountExportDialog,
    AccountDeleteDialog,
    AccountSettingsDialog,
    MstOnboardingDialog,
    MultisigChangeNameDialog,
  },
})
export default class Wallet extends Mixins(AccountActionsMixin, OperationsMixin, QrCodeParserMixin) {
  readonly WalletTabs = WalletTabs;
  readonly accountActions = [
    AccountActionTypes.Rename,
    AccountActionTypes.Export,
    AccountActionTypes.Logout,
    AccountActionTypes.Delete,
  ];

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<WalletTabs>>;
  @state.settings.permissions permissions!: WalletPermissions;
  @state.settings.isMSTAvailable isMSTAvailable!: boolean;
  @state.account.isExternal isExternal!: boolean;
  @state.account.isMST isMST!: boolean;
  @state.account.isMstAddressExist isMstAddressExist!: boolean;

  @getter.transactions.selectedTx selectedTransaction!: Nullable<HistoryItem>;

  @mutation.transactions.resetTxDetailsId private resetTxDetailsId!: FnWithoutArgs;

  currentTab: WalletTabs = WalletTabs.Assets;

  accountSettingsVisibility = false;
  mstOnboardingDialog = false;
  dialogMSTNameChange = false;

  get headerTitle(): string {
    if (!this.selectedTransaction) return this.t('account.accountTitle');

    return this.getTitle(this.selectedTransaction);
  }

  get isMSTAccount(): boolean {
    return this.isMST && api.mst.getMSTName() !== '';
  }

  get hasMSTAccount(): boolean {
    return !this.isMST && (this.isMstAddressExist || api.mst.getMSTName() !== '');
  }

  mounted(): void {
    if (this.currentRouteParams.currentTab) {
      this.currentTab = this.currentRouteParams.currentTab;
    }
  }

  handleSwap(asset: any): void {
    this.$emit('swap', asset);
  }

  handleCreateToken(): void {
    this.navigate({ name: RouteNames.CreateToken });
  }

  handleSwitchAccount(): void {
    this.navigate({ name: RouteNames.WalletConnection });
  }

  handleMST(): void {
    if (this.isMSTAccount) {
      // User is currently in MST account
      this.dialogMSTNameChange = true;
    } else if (this.hasMSTAccount) {
      // User has an MST account but is not currently in it
      this.dialogMSTNameChange = true;
    } else {
      // User does not have an MST account
      this.mstOnboardingDialog = true;
    }
  }

  handleAccountActionType(actionType: string) {
    this.handleAccountAction(actionType, this.account);
  }

  handleAccountSettings(): void {
    this.accountSettingsVisibility = !this.accountSettingsVisibility;
  }

  handleBack(): void {
    if (this.selectedTransaction) {
      this.resetTxDetailsId();
    }
  }

  isMultisig(): boolean {
    return this.isMSTAccount;
  }
}
</script>

<style lang="scss">
.wallet {
  @include custom-tabs;
}
</style>

<style scoped lang="scss">
.wallet {
  margin-top: #{$basic-spacing-medium};
}
</style>
