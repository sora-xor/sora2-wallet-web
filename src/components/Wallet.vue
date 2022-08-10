<template>
  <wallet-base :title="headerTitle" :show-back="!!selectedTransaction" @back="handleBack">
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

      <s-button type="action" alternative rounded :tooltip="t('code.receive')" @click="receiveByQrCode(null)">
        <s-icon name="finance-receive-show-QR-24" size="28" />
      </s-button>

      <s-button type="action" alternative rounded :tooltip="t('account.switch')" @click="handleSwitchAccount">
        <s-icon name="arrows-refresh-ccw-24" size="28" />
      </s-button>
    </wallet-account>

    <div v-show="!selectedTransaction" class="wallet">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab v-for="tab in WalletTabs" :key="tab" :label="t(`wallet.${tab}`)" :name="tab" />
      </s-tabs>
      <component :is="currentTab" @swap="handleSwap" />
    </div>

    <wallet-transaction-details />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import type { HistoryItem } from '@sora-substrate/util';

import TranslationMixin from './mixins/TranslationMixin';
import QrCodeParserMixin from './mixins/QrCodeParserMixin';

import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';
import WalletAssets from './WalletAssets.vue';
import WalletActivity from './WalletActivity.vue';
import QrCodeScanButton from './QrCode/QrCodeScanButton.vue';
import WalletTransactionDetails from './WalletTransactionDetails.vue';

import { RouteNames, WalletTabs } from '../consts';
import { state, action, getter, mutation } from '../store/decorators';
import type { WalletPermissions } from '../consts';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    WalletAssets,
    WalletActivity,
    QrCodeScanButton,
    WalletTransactionDetails,
  },
})
export default class Wallet extends Mixins(TranslationMixin, QrCodeParserMixin) {
  readonly WalletTabs = WalletTabs;

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<WalletTabs>>;
  @state.settings.permissions permissions!: WalletPermissions;
  @getter.transactions.selectedTx selectedTransaction!: HistoryItem;
  @mutation.transactions.setTxDetailsId setTxDetailsId!: (id: Nullable<string>) => void;

  @action.account.logout private logout!: AsyncVoidFn;

  currentTab: WalletTabs = WalletTabs.Assets;

  get headerTitle(): string {
    return this.t(!this.selectedTransaction ? 'wallet.title' : this.t(`operations.${this.selectedTransaction.type}`));
  }

  mounted(): void {
    if (this.currentRouteParams.currentTab) {
      this.currentTab = this.currentRouteParams.currentTab;
    }
  }

  handleChangeTab(value: WalletTabs): void {
    this.currentTab = value;
  }

  handleSwap(asset: any): void {
    this.$emit('swap', asset);
  }

  handleCreateToken(): void {
    this.navigate({ name: RouteNames.CreateToken });
  }

  handleSwitchAccount(): void {
    const navigationArgs = {
      name: RouteNames.WalletConnection,
      params: { isAccountSwitch: true },
    };
    this.navigate(navigationArgs);
    this.logout();
  }

  handleBack(): void {
    if (this.selectedTransaction) {
      this.setTxDetailsId(null);
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
