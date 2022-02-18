<template>
  <wallet-base
    :title="asset.name"
    show-back
    show-clean-history
    :show-action="!isXor"
    action-icon="basic-eye-24"
    action-tooltip="asset.remove"
    :disabled-clean-history="isCleanHistoryDisabled"
    @back="handleBack"
    @action="handleRemoveAsset"
    @cleanHistory="handleCleanHistory"
  >
    <s-card class="asset-details" primary>
      <div class="asset-details-container s-flex">
        <nft-details
          v-if="isNft"
          is-asset-details
          :content-link="nftContentLink"
          :token-name="asset.name"
          :token-symbol="asset.symbol"
          :token-description="asset.description"
          @click-details="handleClickNftDetails"
        />
        <template v-else>
          <i class="asset-logo" :style="getAssetIconStyles(asset.address)" />
          <div :style="balanceStyles" :class="balanceDetailsClasses" @click="isXor && handleClickDetailedBalance()">
            <formatted-amount
              value-can-be-hidden
              symbol-as-decimal
              :value="balance"
              :font-size-rate="FontSizeRate.SMALL"
              :asset-symbol="asset.symbol"
            >
              <s-icon v-if="isXor" name="chevron-down-rounded-16" size="18" />
            </formatted-amount>
          </div>
        </template>
        <formatted-amount
          v-if="price && !isNft"
          value-can-be-hidden
          is-fiat-value
          :value="getFiatBalance(asset)"
          :font-size-rate="FontSizeRate.MEDIUM"
        />
        <div class="asset-details-actions">
          <s-button
            v-for="operation in operations"
            :key="operation.type"
            :class="['asset-details-action', operation.type]"
            :tooltip="getOperationTooltip(operation)"
            :disabled="isOperationDisabled(operation.type)"
            type="action"
            size="medium"
            rounded
            primary
            @click="handleOperation(operation.type)"
          >
            <s-icon :name="operation.icon" size="28" />
          </s-button>
        </div>
        <transition name="fadeHeight">
          <div v-if="isXor && wasBalanceDetailsClicked" class="asset-details-balance-info">
            <div v-for="type in balanceTypes" :key="type" class="balance s-flex p4">
              <div class="balance-label">{{ t(`assets.balance.${type}`) }}</div>
              <formatted-amount-with-fiat-value
                value-can-be-hidden
                value-class="balance-value"
                :value="formatBalance(asset.balance[type])"
                :font-size-rate="FontSizeRate.MEDIUM"
                :font-weight-rate="FontWeightRate.SMALL"
                :asset-symbol="asset.symbol"
                :fiat-value="getFiatBalance(asset, type)"
                fiat-format-as-value
                with-left-shift
              />
            </div>
            <div class="balance s-flex p4">
              <div class="balance-label balance-label--total">{{ t('assets.balance.total') }}</div>
              <formatted-amount-with-fiat-value
                value-can-be-hidden
                value-class="balance-value"
                :value="totalBalance"
                :font-size-rate="FontSizeRate.MEDIUM"
                :font-weight-rate="FontWeightRate.SMALL"
                :asset-symbol="asset.symbol"
                :fiat-value="getFiatBalance(asset, BalanceType.Total)"
                fiat-format-as-value
                with-left-shift
              />
            </div>
          </div>
        </transition>
      </div>
    </s-card>
    <div v-if="isNft" class="asset-details-nft-container">
      <transition name="fadeHeight">
        <div v-if="wasNftDetailsClicked" class="info-line-container">
          <info-line :label="t('createToken.nft.supply.quantity')" :value="balance" />
          <info-line
            class="external-link"
            :label="t('createToken.nft.source.label')"
            :value="displayedNftContentLink"
            :value-tooltip="nftLinkTooltipText"
            @click.native="handleCopyNftLink"
          />
        </div>
      </transition>
    </div>
    <wallet-history :asset="asset" />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import { KnownAssets, KnownSymbols, BalanceType } from '@sora-substrate/util/build/assets/consts';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';
import type { CodecString, AccountHistory, HistoryItem } from '@sora-substrate/util';

import WalletBase from './WalletBase.vue';
import FormattedAmount from './FormattedAmount.vue';
import NftDetails from './NftDetails.vue';
import InfoLine from './InfoLine.vue';
import WalletHistory from './WalletHistory.vue';
import { api } from '../api';
import FormattedAmountMixin from './mixins/FormattedAmountMixin';
import CopyAddressMixin from './mixins/CopyAddressMixin';
import FormattedAmountWithFiatValue from './FormattedAmountWithFiatValue.vue';
import { RouteNames } from '../consts';
import { copyToClipboard, delay, getAssetIconStyles, shortenValue } from '../util';
import { IpfsStorage } from '../util/ipfsStorage';
import { Operations, Account } from '../types/common';
import type { WalletPermissions } from '../consts';

interface Operation {
  type: Operations;
  icon: string;
}

@Component({
  components: {
    WalletBase,
    FormattedAmount,
    FormattedAmountWithFiatValue,
    WalletHistory,
    NftDetails,
    InfoLine,
  },
})
export default class WalletAssetDetails extends Mixins(FormattedAmountMixin, CopyAddressMixin) {
  readonly balanceTypes = Object.values(BalanceType).filter((type) => type !== BalanceType.Total);
  readonly BalanceType = BalanceType;

  @Getter account!: Account;
  @Getter accountAssets!: Array<AccountAsset>;
  @Getter currentRouteParams!: any;
  @Getter history!: AccountHistory<HistoryItem>;
  @Getter permissions!: WalletPermissions;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action clearAccountHistory!: (assetAddress?: string) => Promise<void>;

  wasBalanceDetailsClicked = false;

  // ____________________NFT Token Details_____________________________
  private wasNftLinkCopied = false;
  wasNftDetailsClicked = false;
  nftContentLink = '';

  get isNft(): boolean {
    return api.assets.isNft(this.asset);
  }

  get nftLinkTooltipText(): string {
    return this.wasNftLinkCopied ? this.t('assets.copied') : this.t('createToken.nft.link.copyLink');
  }

  get displayedNftContentLink(): string {
    const hostname = IpfsStorage.getStorageHostname(this.nftContentLink);
    const path = IpfsStorage.getIpfsPath(this.nftContentLink);
    return shortenValue(hostname + '/ipfs/' + path, 25);
  }

  private async setNftMeta(): Promise<void> {
    const ipfsPath = this.asset.content as string;
    this.nftContentLink = IpfsStorage.constructFullIpfsUrl(ipfsPath);
  }

  handleClickNftDetails(): void {
    this.wasNftDetailsClicked = !this.wasNftDetailsClicked;
  }

  async handleCopyNftLink(event?: Event): Promise<void> {
    event && event.stopImmediatePropagation();
    await copyToClipboard(this.nftContentLink);
    this.wasNftLinkCopied = true;
    await delay(1000);
    this.wasNftLinkCopied = false;
  }

  mounted(): void {
    if (this.isNft) {
      this.setNftMeta();
    }
  }
  // __________________________________________________________

  formatBalance(value: CodecString): string {
    return this.formatCodecNumber(value, this.asset.decimals);
  }

  get operations(): Array<Operation> {
    const list: Array<Operation> = [];

    if (this.permissions.sendAssets) {
      list.push({ type: Operations.Send, icon: 'finance-send-24' });
    }
    if (this.permissions.copyAssets) {
      list.push({ type: Operations.Receive, icon: 'basic-receive-24' });
    }
    if (this.permissions.swapAssets && !this.isNft) {
      list.push({ type: Operations.Swap, icon: 'arrows-swap-24' });
    }
    if (this.permissions.addLiquidity && !this.isNft) {
      list.push({ type: Operations.Liquidity, icon: 'basic-drop-24' });
    }
    if (this.permissions.bridgeAssets && !this.isNft) {
      list.push({ type: Operations.Bridge, icon: 'grid-block-distribute-vertically-24' });
    }

    return list;
  }

  get price(): Nullable<CodecString> {
    return this.getAssetFiatPrice(this.asset);
  }

  get asset(): AccountAsset {
    // currentRouteParams.asset was added here to avoid a case when the asset is not found
    return (
      this.accountAssets.find(({ address }) => address === this.currentRouteParams.asset.address) ||
      (this.currentRouteParams.asset as AccountAsset)
    );
  }

  get balance(): string {
    return this.formatCodecNumber(this.asset.balance.transferable, this.asset.decimals);
  }

  get totalBalance(): string {
    return this.formatBalance(this.asset.balance.total);
  }

  get isEmptyBalance(): boolean {
    return this.isCodecZero(this.asset.balance.transferable, this.asset.decimals);
  }

  get balanceStyles(): object {
    const balanceLength = this.balance.length;
    // We've decided to calcutate font size values manually
    let fontSize = 30;
    if (balanceLength > 35) {
      fontSize = 14;
    } else if (balanceLength > 24 && balanceLength <= 35) {
      fontSize = 16;
    } else if (balanceLength > 17 && balanceLength <= 24) {
      fontSize = 20;
    }
    return { fontSize: `${fontSize}px` };
  }

  get balanceDetailsClasses(): Array<string> {
    const cssClasses: Array<string> = ['asset-details-balance', 'd2'];
    if (this.isXor) {
      cssClasses.push('asset-details-balance--clickable');
    }
    if (this.wasBalanceDetailsClicked) {
      cssClasses.push('asset-details-balance--clicked');
    }
    return cssClasses;
  }

  get isXor(): boolean {
    const asset = KnownAssets.get(this.asset.address);
    return asset && asset.symbol === KnownSymbols.XOR;
  }

  get isCleanHistoryDisabled(): boolean {
    if (!this.asset) return true;

    return Object.values(this.history).every(
      (item) => ![item.assetAddress, item.asset2Address].includes(this.asset.address)
    );
  }

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }

  getOperationTooltip(operation: Operation): string {
    if (operation.type !== Operations.Receive || !this.wasAddressCopied) {
      return this.t(`assets.${operation.type}`);
    }
    // TODO: [UI-LIB] add key property with the content value for tooltip in buttons to rerender it each time
    return this.t('assets.copied');
  }

  isOperationDisabled(operation: Operations): boolean {
    return operation === Operations.Send && this.isEmptyBalance;
  }

  handleOperation(operation: Operations): void {
    switch (operation) {
      case Operations.Send:
        this.navigate({ name: RouteNames.WalletSend, params: { asset: this.asset } });
        break;
      case Operations.Receive:
        this.handleCopyAddress(this.account.address);
        break;
      default:
        this.$emit(operation, this.asset);
        break;
    }
  }

  handleClickDetailedBalance(): void {
    this.wasBalanceDetailsClicked = !this.wasBalanceDetailsClicked;
  }

  getAssetIconStyles = getAssetIconStyles;

  getBalance(asset: AccountAsset, type: BalanceType): string {
    return `${this.formatCodecNumber(asset.balance[type], asset.decimals)}`;
  }

  handleRemoveAsset(): void {
    api.assets.removeAccountAsset(this.asset.address);
    this.handleBack();
  }

  async handleCleanHistory(): Promise<void> {
    if (!this.asset) return;
    await this.clearAccountHistory(this.asset.address);
  }
}
</script>

<style scoped lang="scss">
@import '../styles/icons';

.asset-details {
  padding: 0 !important;
  margin-bottom: 0;
  &.s-card.neumorphic {
    padding-top: 0;
    padding-bottom: 0;
  }
  &-container {
    flex-direction: column;
    align-items: center;
    @include fadeHeight;
    .formatted-amount--fiat-value {
      + .asset-details-actions {
        margin-top: #{$basic-spacing-small};
      }
    }
  }
  &-nft-container {
    @include fadeHeight(50px, 0.1s);
  }
  &-balance {
    width: 100%;
    margin-top: var(--s-basic-spacing);
    position: relative;
    text-align: center;
    &--clickable {
      cursor: pointer;
    }
    & + .formatted-amount--fiat-value {
      width: 100%;
      text-align: center;
      font-size: var(--s-font-size-medium);
      font-weight: 600;
    }
    .s-icon-chevron-down-rounded-16 {
      display: inline-block;
      margin-left: var(--s-basic-spacing);
      height: var(--s-icon-font-size-small);
      width: var(--s-icon-font-size-small);
      transition: transform 0.3s;
      background-color: var(--s-color-base-content-secondary);
      color: var(--s-color-base-on-accent);
      border-radius: 50%;
      text-align: left;
    }
    &--clicked .s-icon-chevron-down-rounded-16 {
      padding-right: #{$basic-spacing-small};
      transform: rotate(180deg);
    }
    &-info {
      width: 100%;
      margin-top: #{$basic-spacing-medium};
      .balance {
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: $basic-spacing-mini;
        border-bottom: 1px solid var(--s-color-base-border-secondary);
        font-size: var(--s-font-size-extra-small);
        &-label {
          text-transform: uppercase;
          margin-right: var(--s-basic-spacing);
          font-weight: 300;
          white-space: nowrap;
        }
        &-label--total {
          font-weight: 600;
        }
      }
    }
  }
  &-actions {
    margin-top: #{$basic-spacing-medium};
  }
  .asset-logo {
    @include asset-logo-styles(48px);
  }
}

.info-line-container {
  @include fadeHeight;
}
</style>

<style lang="scss">
.external-link {
  .info-line-value {
    cursor: pointer;
  }
}
</style>
