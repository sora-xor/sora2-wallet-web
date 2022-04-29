<template>
  <wallet-base :title="t('wallet.title')">
    <template #actions>
      <s-button
        v-if="permissions.createAssets"
        type="action"
        :tooltip="t('wallet.createToken')"
        @click="handleCreateToken"
      >
        <s-icon name="various-atom-24" size="28" />
      </s-button>
    </template>

    <wallet-account>
      <qr-code-scan-button alternative @change="parseQrCodeValue" />

      <s-button type="action" alternative rounded :tooltip="t('code.recieve')" @click="recieveByQrCode(null)">
        <s-icon name="finance-receive-show-QR-24" size="28" />
      </s-button>

      <s-button type="action" alternative rounded :tooltip="t('account.switch')" @click="handleSwitchAccount">
        <s-icon name="arrows-refresh-ccw-24" size="28" />
      </s-button>
    </wallet-account>

    <div class="wallet">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab v-for="tab in WalletTabs" :key="tab" :label="t(`wallet.${tab}`)" :name="tab" />
      </s-tabs>
      <component :is="currentTab" @swap="handleSwap" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';
import QrCodeParserMixin from './mixins/QrCodeParserMixin';

import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';
import WalletAssets from './WalletAssets.vue';
import WalletActivity from './WalletActivity.vue';
import QrCodeScanButton from './QrCodeScanButton.vue';

import { RouteNames, WalletTabs } from '../consts';
import { state, action } from '../store/decorators';
import type { WalletPermissions } from '../consts';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    WalletAssets,
    WalletActivity,
    QrCodeScanButton,
  },
})
export default class Wallet extends Mixins(TranslationMixin, QrCodeParserMixin) {
  readonly WalletTabs = WalletTabs;

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<WalletTabs>>;
  @state.settings.permissions permissions!: WalletPermissions;

  @action.account.logout private logout!: AsyncVoidFn;

  currentTab: WalletTabs = WalletTabs.Assets;

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
