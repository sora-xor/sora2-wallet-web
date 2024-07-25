<template>
  <wallet-base :title="'SBT'" show-back @back="handleBack" class="sbt-permissions-info">
    <s-card class="asset-details" primary>
      <div class="asset-details-container s-flex">
        <token-logo :token="asset" size="large" />
        <div class="asset-details-title">KYC Verification</div>
        <div class="asset-details-desc">
          This SBT provides access to multiple tokens & pools and is attached to your account
        </div>
        <div class="asset-details-subtitle">SBT issued by</div>
        <account-card class="asset-details-issuer">
          <template #avatar>
            <wallet-avatar slot="avatar" class="account-gravatar" :address="asset.address" :size="28" />
          </template>
          <template #name>{{ 'KYC provider' }}</template>
          <template #description>
            <div class="asset-details-instition-mark">Regulated Insitution</div>
            <formatted-address :value="asset.address" :symbols="24" :tooltip-text="t('account.walletAddress')" />
          </template>
        </account-card>
        <info-line :label="'Expiry date'" :label-tooltip="'Expiry date'" :value="expiryDate" />
        <info-line :label="'Expires in'" :label-tooltip="'Expires in'" :value="expiryDate" />
        <div v-if="regulatedAssets.length" class="asset-details-regulated-section">
          <div class="asset-details-subtitle">Access permitted</div>
          <div class="asset-details-regulated-assets">
            <div v-for="(asset, index) in regulatedAssets" :key="index">
              <asset-list-item :asset="asset" with-clickable-logo @show-details="handleOpenAssetDetails">
                <template #default="asset">
                  <s-button
                    class="wallet-assets__button el-button--details"
                    type="action"
                    size="small"
                    alternative
                    :tooltip="t('assets.details')"
                    @click="handleOpenAssetDetails(asset)"
                  >
                    <s-icon name="arrows-chevron-right-rounded-24" size="24" />
                  </s-button>
                </template>
              </asset-list-item>
              <s-divider v-if="index < regulatedAssets.length - 1" />
            </div>
          </div>
        </div>
        <div v-else class="asset-details-subtitle asset-details-subtitle--no-permission">No additional permissions</div>
      </div>
    </s-card>
  </wallet-base>
</template>

<script lang="ts">
import { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../../api';
import { RouteNames } from '../../consts';
import { mutation, state } from '../../store/decorators';
import { Route } from '../../store/router/types';
import AccountCard from '../Account/AccountCard.vue';
import WalletAvatar from '../Account/WalletAvatar.vue';
import AssetListItem from '../AssetListItem.vue';
import TokenLogo from '../AssetLogos/TokenLogo.vue';
import InfoLine from '../InfoLine.vue';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import WalletBase from '../WalletBase.vue';

@Component({
  components: {
    AccountCard,
    AssetListItem,
    FormattedAddress,
    TokenLogo,
    InfoLine,
    WalletAvatar,
    WalletBase,
  },
})
export default class WalletAssetDetails extends Mixins(TranslationMixin) {
  @mutation.router.navigate navigate!: (options: Route) => Promise<void>;
  @state.account.accountAssets private accountAssets!: Array<AccountAsset>;

  @Prop({ required: true, type: Object }) readonly asset!: Asset;

  regulatedAssets: Array<Asset | undefined> = [];

  get expiryDate(): Nullable<string> {
    const now = new Date();
    const oneMonthAhead = now.setMonth(now.getMonth() + 1);
    return this.formatDate(oneMonthAhead, 'LL');
  }

  handleOpenAssetDetails(asset: AccountAsset): void {
    this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset } });
  }

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }

  async mounted(): Promise<void> {
    const { regulatedAssets } = await api.extendedAssets.getSbtMetaInfo(this.asset.address);
    const infos = regulatedAssets.map((address) => api.assets.getAssetInfo(address));

    const regulatedAssetsInfos = (await Promise.allSettled(infos))
      .map((result) => (result.status === 'fulfilled' ? result.value : undefined))
      .filter(Boolean);

    this.regulatedAssets = regulatedAssetsInfos;
  }
}
</script>

<style lang="scss">
.sbt-permissions-info {
  .asset-details {
    &-container {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    &-title {
      margin-top: 16px;
      font-weight: 500;
      font-size: 24px;
    }

    &-desc {
      margin-top: 8px;
      font-weight: 300;
      color: var(--s-color-base-content-secondary);
      text-align: center;
    }

    &-regulated-section {
      width: 100%;
    }

    &-issuer {
      margin-top: 8px;
      margin-bottom: 16px;
    }

    &-subtitle {
      margin-top: 24px;
      text-transform: uppercase;
      align-self: flex-start;
      font-weight: 600;
      color: var(--s-color-base-content-secondary);

      &--no-permission {
        align-self: center;
      }
    }

    &-instition-mark {
      font-size: 12px;
      color: var(--s-color-status-info);
    }
  }

  .account-card {
    width: 100%;
  }

  .el-divider {
    margin: 0;
  }
}
</style>
