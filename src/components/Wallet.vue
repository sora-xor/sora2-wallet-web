<template>
  <wallet-base :title="t('wallet.title')">
    <template #actions>
      <qr-code-download @change="handleQrCode" />

      <s-button
        v-if="permissions.createAssets"
        type="action"
        :tooltip="t('wallet.createToken')"
        @click="handleCreateToken"
      >
        <s-icon name="various-atom-24" size="28" />
      </s-button>
    </template>
    <wallet-account show-controls />
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
import { Action, Getter } from 'vuex-class';

import { decodeAddress } from '@polkadot/util-crypto';

import TranslationMixin from './mixins/TranslationMixin';
import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';
import WalletAssets from './WalletAssets.vue';
import WalletActivity from './WalletActivity.vue';
import QrCodeDownload from './QrCode/QrCodeDownload.vue';
import { RouteNames, WalletTabs } from '../consts';

import type { Asset } from '@sora-substrate/util';
import type { Account } from '../types/common';
import type { WalletPermissions } from '../consts';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    WalletAssets,
    WalletActivity,
    QrCodeDownload,
  },
})
export default class Wallet extends Mixins(TranslationMixin) {
  readonly WalletTabs = WalletTabs;

  @Getter assets!: Array<Asset>;
  @Getter currentRouteParams!: any;
  @Getter account!: Account;
  @Getter activity!: Array<History>;
  @Getter permissions!: WalletPermissions;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action searchAsset!: (address: string) => Promise<Asset>;

  currentTab: WalletTabs = WalletTabs.Assets;

  mounted() {
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

  async handleQrCode(value: Nullable<string>): Promise<void> {
    if (!value) return;

    const [base, assetId] = value.split('::');

    if (!base || !assetId) return;

    const asset = await this.searchAsset(assetId);

    if (!asset) return;

    const [chain, address, publicKey] = base.split(':');

    if (chain !== 'substrate') return;

    const pKey = decodeAddress(address, false);
    const pKeyHex = `0x${Buffer.from(pKey).toString('hex')}`;

    if (pKeyHex !== publicKey) return;

    this.navigate({
      name: RouteNames.WalletSend,
      params: {
        asset,
        address,
      },
    });
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
