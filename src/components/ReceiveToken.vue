<template>
  <wallet-base :title="title" show-back @back="handleBack">
    <template #actions>
      <s-button type="action" :tooltip="t('code.download')" @click="downloadCode">
        <s-icon name="basic-pulse-24" size="28" />
      </s-button>
    </template>

    <div class="receive-token">
      <qr-code ref="qrcode" :value="code" />
      <s-float-input
        v-model="amount"
        has-locale-string
        :decimals="asset.decimals"
        :delimiters="delimiters"
        :placeholder="t('amountText')"
        class="receive-token__amount"
      >
        <template #right>
          <token-logo :token="asset" size="small" />
        </template>
      </s-float-input>
      <wallet-account class="receive-token__account" primary shadow="never" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/sdk';
import { Component, Mixins, Ref } from 'vue-property-decorator';

import { api } from '../api';
import { state, getter, mutation } from '../store/decorators';
import { svgSaveAs, IMAGE_EXTENSIONS } from '../util/image';

import WalletAccount from './Account/WalletAccount.vue';
import TokenLogo from './AssetLogos/TokenLogo.vue';
import NotificationMixin from './mixins/NotificationMixin';
import QrCode from './QrCode/QrCode.vue';
import WalletBase from './WalletBase.vue';

import type { RouteNames } from '../consts';
import type { Route } from '../store/router/types';
import type { PolkadotJsAccount } from '../types/common';
import type { AccountAsset } from '@sora-substrate/sdk/build/assets/types';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    QrCode,
    TokenLogo,
  },
})
export default class ReceiveToken extends Mixins(NotificationMixin) {
  @state.router.currentRouteParams private currentRouteParams!: Record<string, AccountAsset>;
  @state.router.previousRoute private previousRoute!: RouteNames;
  @state.router.previousRouteParams private previousRouteParams!: Record<string, unknown>;
  @getter.account.account private account!: PolkadotJsAccount;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  @Ref('qrcode') readonly qrcode!: QrCode;

  readonly delimiters = FPNumber.DELIMITERS_CONFIG;

  public amount = '';

  get asset(): AccountAsset {
    return this.currentRouteParams.asset;
  }

  get title(): string {
    return this.t('asset.receive', { symbol: this.asset.symbol });
  }

  get code(): string {
    const chain = 'substrate';
    const accountAddress = this.account.address;
    const publicKey = `0x${api.getPublicKeyByAddress(accountAddress)}`;
    const accountName = this.account.name || '';
    const assetAddress = this.asset.address;
    const amount = this.amount;

    return [chain, accountAddress, publicKey, accountName, assetAddress, amount].join(':');
  }

  downloadCode(): void {
    this.withAppNotification(async () => {
      const codeSvg = (this.qrcode as any).element as SVGSVGElement;
      const filename = `${this.asset.symbol}_${this.account.address}`;

      await svgSaveAs(codeSvg, filename, IMAGE_EXTENSIONS.JPEG);
    });
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
$amount-width: 260px;

.receive-token {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: $basic-spacing-medium;

  &__amount {
    max-width: $amount-width;
  }

  &__account {
    max-width: 100%;
  }
}
</style>
