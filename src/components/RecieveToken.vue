<template>
  <wallet-base :title="title" show-back @back="handleBack">
    <template #actions>
      <s-button type="action" :tooltip="t('code.download')" @click="downloadCode">
        <s-icon name="basic-pulse-24" size="28" />
      </s-button>
    </template>

    <div class="recieve-token">
      <qr-code ref="qrcode" :value="code" />
      <wallet-account primary shadow="never" class="account-card" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Ref } from 'vue-property-decorator';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

import TranslationMixin from './mixins/TranslationMixin';

import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';
import QrCode from './QrCode.vue';

import { api } from '../api';
import { RouteNames } from '../consts';
import { svgSaveAs, IMAGE_EXTENSIONS } from '../util/image';
import { state, getter, mutation } from '../store/decorators';
import type { Account } from '../types/common';
import type { Route } from '../store/router/types';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    QrCode,
  },
})
export default class RecieveToken extends Mixins(TranslationMixin) {
  @state.router.currentRouteParams private currentRouteParams!: Record<string, AccountAsset>;
  @state.router.previousRoute private previousRoute!: RouteNames;
  @state.router.previousRouteParams private previousRouteParams!: Record<string, unknown>;
  @getter.account.account private account!: Account;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  @Ref('qrcode') readonly qrcode!: QrCode;

  get asset(): AccountAsset {
    return this.currentRouteParams.asset;
  }

  get title(): string {
    return this.t('asset.recieve', { symbol: this.asset.symbol });
  }

  get code(): string {
    const assetAddress = this.asset.address;
    const accountAddress = this.account.address;
    const accountName = this.account.name;
    const publicKey = api.getPublicKeyByAddress(accountAddress);

    return `substrate:${accountAddress}:0x${publicKey}:${accountName}:${assetAddress}`;
  }

  async downloadCode(): Promise<void> {
    try {
      const codeSvg = (this.qrcode as any).element as SVGSVGElement;
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

  & > *:not(:last-child) {
    margin-bottom: $basic-spacing-medium;
  }
}
</style>
