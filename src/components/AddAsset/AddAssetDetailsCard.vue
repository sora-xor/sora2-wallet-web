<template>
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
      {{ t('addAssetText') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import Theme from '@soramitsu-ui/ui-vue2/lib/types/Theme';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../../api';
import { getter } from '../../store/decorators';
import AssetListItem from '../AssetListItem.vue';
import AddAssetMixin from '../mixins/AddAssetMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletBase from '../WalletBase.vue';

import type { WhitelistIdsBySymbol } from '../../types/common';
import type { Asset, Whitelist } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    WalletBase,
    AssetListItem,
  },
})
export default class AddAssetDetailsCard extends Mixins(TranslationMixin, LoadingMixin, AddAssetMixin) {
  @getter.account.whitelist whitelist!: Whitelist;
  @getter.account.whitelistIdsBySymbol whitelistIdsBySymbol!: WhitelistIdsBySymbol;

  @Prop({ required: true, type: Object }) readonly asset!: Asset;
  @Prop({ default: Theme.LIGHT, type: String }) readonly theme!: Theme;

  isConfirmed = false;

  get isCardPrimary(): boolean {
    return this.theme !== Theme.DARK;
  }

  get isWhitelist(): boolean {
    return api.assets.isWhitelist(this.asset, this.whitelist);
  }

  get isBlacklist(): boolean {
    return api.assets.isBlacklist(this.asset, this.whitelistIdsBySymbol);
  }

  get assetCardStatus(): string {
    return this.isWhitelist ? 'success' : 'error';
  }

  get assetNatureText(): string {
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

  async handleAddAsset(): Promise<void> {
    this.$emit('add');
    this.addAccountAsset(this.asset);
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

    & {
      padding-top: 0;
      padding-bottom: 0;
    }
  }
  &_action {
    width: 100%;
  }
  &_text {
    color: var(--s-color-status-warning);
  }
}
</style>
