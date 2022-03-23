<template>
  <wallet-base :title="t('addAsset.title')" show-back @back="handleBack">
    <div class="add-asset-details">
      <s-card shadow="always" size="small" border-radius="mini" pressed>
        <asset-list-item :asset="asset">
          <template #append>
            <s-card size="mini" :status="assetCardStatus" primary>
              <div class="asset-nature">{{ assetNatureText }}</div>
            </s-card>
          </template>
        </asset-list-item>
      </s-card>
      <s-card status="warning" :primary="isCardPrimary" shadow="always" class="add-asset-details_text">
        <div class="p2">{{ t('addAsset.warningTitle') }}</div>
        <div class="warning-text p4">{{ t('addAsset.warningMessage') }}</div>
      </s-card>
      <div class="add-asset-details_confirm">
        <s-switch v-model="isConfirmed" :disabled="loading" />
        <span>{{ t('addAsset.understand') }}</span>
      </div>
      <s-button
        class="add-asset-details_action s-typography-button--large"
        type="primary"
        :disabled="!asset || !isConfirmed || loading"
        @click="handleAddAsset"
      >
        {{ t('addAsset.action') }}
      </s-button>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';
import type { Asset, Whitelist } from '@sora-substrate/util/build/assets/types';

import LoadingMixin from './mixins/LoadingMixin';
import TranslationMixin from './mixins/TranslationMixin';
import WalletBase from './WalletBase.vue';
import AssetListItem from './AssetListItem.vue';
import { RouteNames } from '../consts';
import { api } from '../api';
import type { WhitelistIdsBySymbol } from '../types/common';

@Component({
  components: {
    WalletBase,
    AssetListItem,
  },
})
export default class AddAssetDetails extends Mixins(TranslationMixin, LoadingMixin) {
  asset: Nullable<Asset> = null;
  isConfirmed = false;

  @Getter currentRouteParams!: any;
  @Getter whitelist!: Whitelist;
  @Getter whitelistIdsBySymbol!: WhitelistIdsBySymbol;
  @Getter libraryTheme!: Theme;
  @Action back!: AsyncVoidFn;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action addAsset!: (address?: string) => Promise<void>;

  created(): void {
    if (!this.currentRouteParams.asset) {
      this.back();
      return;
    }
    this.asset = this.currentRouteParams.asset;
  }

  get isCardPrimary(): boolean {
    return this.libraryTheme !== Theme.DARK;
  }

  get isWhitelist(): boolean {
    if (!this.asset) {
      return false;
    }
    return api.assets.isWhitelist(this.asset, this.whitelist);
  }

  get isBlacklist(): boolean {
    if (!this.asset) {
      return false;
    }
    return api.assets.isBlacklist(this.asset, this.whitelistIdsBySymbol);
  }

  get assetCardStatus(): string {
    return this.isWhitelist ? 'success' : 'error';
  }

  get assetNatureText(): string {
    if (!this.asset) {
      return '';
    }
    const isWhitelist = this.isWhitelist;
    const isBlacklist = this.isBlacklist;
    if (isWhitelist) {
      return this.t('addAsset.approved');
    }
    if (isBlacklist) {
      return this.t('addAsset.scam');
    }
    return this.t('addAsset.unknown');
  }

  handleBack(): void {
    this.back();
  }

  async handleAddAsset(): Promise<void> {
    await this.withLoading(async () => await this.addAsset((this.asset || {}).address));
    this.navigate({ name: RouteNames.Wallet, params: { asset: this.asset } });
    this.$emit('add-asset');
  }
}
</script>

<style scoped lang="scss">
.add-asset-details {
  & > *:not(:last-child) {
    margin-bottom: #{$basic-spacing-medium};
  }

  .asset-nature {
    font-size: var(--s-font-size-mini);
    font-weight: 300;
    letter-spacing: var(--s-letter-spacing-small);
    line-height: var(--s-line-height-medium);
  }

  &_confirm {
    @include switch-block;
    padding-top: 0;
    padding-bottom: 0;
  }
  &_action {
    width: 100%;
  }
  &_text {
    color: var(--s-color-status-warning);
  }
}
</style>
