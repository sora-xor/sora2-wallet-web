<template>
  <wallet-base :title="TranslationConsts.SBT" show-back @back="handleBack" class="sbt-permissions-info">
    <s-card class="asset-details" primary>
      <div class="asset-details-container s-flex">
        <token-logo :token="asset" size="large" />
        <div class="asset-details-title">{{ t('sbtDetails.kycVerification', { KYC: TranslationConsts.KYC }) }}</div>
        <div class="asset-details-desc">
          {{ t('sbtDetails.description') }}
        </div>
        <div class="asset-details-subtitle">{{ t('sbtDetails.issuedBy', { SBT: TranslationConsts.SBT }) }}</div>
        <account-card class="asset-details-issuer">
          <template #avatar>
            <wallet-avatar slot="avatar" class="account-gravatar" :address="asset.address" :size="28" />
          </template>
          <template #name>
            {{ t('sbtDetails.kycProvider', { KYC: TranslationConsts.KYC }) }}
            <s-icon name="el-icon-success" size="16" />
          </template>
          <template #description>
            <div class="asset-details-instition-mark">{{ t('sbtDetails.regulatedInsitution') }}</div>
            <formatted-address :value="asset.address" :symbols="24" :tooltip-text="t('account.walletAddress')" />
          </template>
        </account-card>
        <template v-if="showExpiryDate">
          <info-line
            :label="t('sbtDetails.expiryDate')"
            :label-tooltip="t('sbtDetails.expiryDateTooltip')"
            :value="expiryDate"
          />
          <info-line
            :label="t('sbtDetails.expiresIn')"
            :label-tooltip="t('sbtDetails.expiresInTooltip')"
            :value="expiresIn"
          />
        </template>
        <div v-if="regulatedAssets.length" class="asset-details-regulated-section">
          <div class="asset-details-subtitle">{{ regulatedAssetsTitle }}</div>
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
        <div v-else class="asset-details-subtitle asset-details-subtitle--no-permission">
          {{ t('sbtDetails.noPermissions') }}
        </div>
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
import NumberFormatterMixin from '../mixins/NumberFormatterMixin';
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
export default class WalletAssetDetails extends Mixins(TranslationMixin, NumberFormatterMixin) {
  @state.account.accountAssets private accountAssets!: Array<AccountAsset>;
  @state.account.address private connected!: string;
  @mutation.router.navigate navigate!: (options: Route) => Promise<void>;

  @Prop({ required: true, type: Object }) readonly asset!: Asset;

  regulatedAssets: Array<Asset | undefined> = [];
  showExpiryDate = false;
  expiryDate = '';
  expiresIn = '';
  isOwnerOpenedPage = false;

  get regulatedAssetsTitle(): string {
    return this.isOwnerOpenedPage ? this.t('sbtDetails.listOperable') : this.t('sbtDetails.accessPermitted');
  }

  handleOpenAssetDetails(asset: AccountAsset): void {
    this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset } });
  }

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }

  isZeroBalance(asset: AccountAsset): boolean {
    return this.isCodecZero(asset.balance.transferable, asset.decimals);
  }

  async checkExpirationDate(): Promise<void> {
    const ownedAssets = await api.assets.getOwnedAssetIds(this.connected);

    if (ownedAssets.includes(this.asset.address)) {
      this.showExpiryDate = false;
      this.isOwnerOpenedPage = true;
      return;
    }

    if (this.isZeroBalance(this.asset as AccountAsset)) {
      this.showExpiryDate = false;
      return;
    }

    this.showExpiryDate = true;

    const expiryDate = await api.extendedAssets.getSbtExpiration(this.connected, this.asset.address);

    this.expiryDate = this.formatDate(Number(expiryDate), 'lll');
    this.expiresIn = this.getRelativeTime(Number(expiryDate));
  }

  async mounted(): Promise<void> {
    const { regulatedAssets } = await api.extendedAssets.getSbtMetaInfo(this.asset.address);
    const infos = regulatedAssets.map((address) => api.assets.getAssetInfo(address));

    const regulatedAssetsInfos = (await Promise.allSettled(infos))
      .map((result) => (result.status === 'fulfilled' ? result.value : undefined))
      .filter(Boolean);

    this.regulatedAssets = regulatedAssetsInfos;

    this.checkExpirationDate();
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
      margin-top: $basic-spacing;
      font-size: var(--s-icon-font-size-big);
      font-weight: 500;
    }

    &-desc {
      margin-top: $inner-spacing-mini;
      color: var(--s-color-base-content-secondary);
      text-align: center;
      font-weight: 300;
      width: 80%;
    }

    &-regulated-section {
      width: 100%;
    }

    &-issuer {
      margin-bottom: $basic-spacing;
      margin-top: $inner-spacing-mini;
    }

    &-subtitle {
      color: var(--s-color-base-content-secondary);
      margin-top: $inner-spacing-big;
      text-transform: uppercase;
      align-self: flex-start;
      font-weight: 600;

      &--no-permission {
        align-self: center;
      }
    }

    &-instition-mark {
      font-size: var(--s-font-size-mini);
      color: var(--s-color-status-info);
    }
  }

  .account-card {
    width: 100%;
  }

  // overwrite card
  .el-card.asset-details {
    padding: 0 !important;
  }

  .el-divider {
    margin: 0;
  }

  .el-icon-success {
    color: var(--s-color-fiat-value);
    margin-left: 4px;
  }
}
</style>
