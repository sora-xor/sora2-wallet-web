<template>
  <wallet-base :title="title" show-back @back="handleBack">
    <template #actions>
      <s-button type="action" :tooltip="t('asset.code.download')" @click="downloadCode">
        <s-icon name="basic-pulse-24" size="28" />
      </s-button>
    </template>

    <div class="recieve-token">
      <qr-code ref="code" :value="code" />
      <wallet-account primary shadow="never" class="account-card" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import TranslationMixin from './mixins/TranslationMixin';

import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';
import QrCode from './QrCode/QrCode.vue';

import { api } from '../api';
import { RouteNames } from '../consts';
import { svgSaveAs, IMAGE_EXTENSIONS } from '../util/image';

import type { AccountAsset } from '@sora-substrate/util';
import type { Account } from '../types/common';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    QrCode,
  },
})
export default class RecieveToken extends Mixins(TranslationMixin) {
  @Getter account!: Account;
  @Getter currentRouteParams!: any;
  @Getter previousRoute!: RouteNames;
  @Getter previousRouteParams!: any;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  get asset(): AccountAsset {
    return this.currentRouteParams.asset;
  }

  get title(): string {
    return this.t('asset.recieve', { symbol: this.asset.symbol });
  }

  get code(): string {
    const assetAddress = this.asset.address;
    const accountAddress = this.account.address;
    const publicKey = api.getPublicKeyByAddress(accountAddress);

    return `substrate:${accountAddress}:0x${publicKey}::${assetAddress}`;
  }

  async downloadCode(): Promise<void> {
    try {
      const codeSvg = (this.$refs.code as any).element;
      const filename = `${this.asset.symbol}_${this.account.address}`;

      await svgSaveAs(codeSvg, filename, IMAGE_EXTENSIONS.JPEG);
    } catch (error) {
      this.$notify({
        message: `${this.t('warningText')} ${error}`,
        type: 'warning',
        title: '',
      });
    }
  }

  handleBack(): void {
    this.navigate({
      name: this.previousRoute,
      params: this.previousRouteParams,
    });
  }
}
</script>

<style lang="scss" scoped>
.recieve-token {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  & > * {
    margin-bottom: $basic-spacing-medium;
  }
}
</style>
