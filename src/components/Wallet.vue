<template>
  <wallet-base :title="headerTitle" :show-back="!!selectedTransaction" :reset-focus="headerTitle" @back="handleBack">
    <template v-if="!selectedTransaction" #actions>
      <s-button
        v-if="permissions.createAssets"
        type="action"
        :tooltip="t('wallet.createToken')"
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

      <account-actions />
    </wallet-account>

    <div v-show="!selectedTransaction" class="wallet">
      <s-tabs v-model="currentTab" type="rounded">
        <s-tab v-for="tab in WalletTabs" :key="tab" :label="t(`wallet.${tab}`)" :name="tab" />
      </s-tabs>
      <component :is="currentTab" @swap="handleSwap" />
    </div>

    <wallet-transaction-details v-if="selectedTransaction" />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import type { HistoryItem } from '@sora-substrate/util';

import OperationsMixin from './mixins/OperationsMixin';
import QrCodeParserMixin from './mixins/QrCodeParserMixin';

import WalletBase from './WalletBase.vue';
import WalletAccount from './Account/WalletAccount.vue';
import WalletAssets from './WalletAssets.vue';
import WalletActivity from './WalletActivity.vue';
import QrCodeScanButton from './QrCode/QrCodeScanButton.vue';
import WalletTransactionDetails from './WalletTransactionDetails.vue';
import AccountActions from './Account/Actions.vue';

import { RouteNames, WalletTabs } from '../consts';
import { state, getter, mutation } from '../store/decorators';
import type { WalletPermissions } from '../consts';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    WalletAssets,
    WalletActivity,
    QrCodeScanButton,
    AccountActions,
    WalletTransactionDetails,
  },
})
export default class Wallet extends Mixins(OperationsMixin, QrCodeParserMixin) {
  readonly WalletTabs = WalletTabs;

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<WalletTabs>>;
  @state.settings.permissions permissions!: WalletPermissions;
  @getter.transactions.selectedTx selectedTransaction!: Nullable<HistoryItem>;
  @mutation.transactions.resetTxDetailsId private resetTxDetailsId!: FnWithoutArgs;

  currentTab: WalletTabs = WalletTabs.Assets;

  get headerTitle(): string {
    if (!this.selectedTransaction) return this.t('wallet.title');

    return this.getTitle(this.selectedTransaction);
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

  handleBack(): void {
    if (this.selectedTransaction) {
      this.resetTxDetailsId();
    }
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
