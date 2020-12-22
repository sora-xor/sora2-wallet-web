<template>
  <wallet-base :title="t(`walletSend.${step === 1 ? 'title' : 'confirmTitle'}`)" show-back @back="handleBack">
    <div class="wallet-send">
      <template v-if="step === 1">
        <s-input
          class="wallet-send-address"
          :maxlength="128"
          :placeholder="t('walletSend.address')"
          border-radius="mini"
          v-model="address"
        />
        <div class="wallet-send-amount">
          <div class="input-line">
            <div class="input-line-title">{{ t('walletSend.amount') }}</div>
            <div class="input-line-balance">
              <span class="asset-balance-title">{{ t('walletSend.balance') }}</span>
              <span class="asset-balance-value">{{ asset.balance }}</span>
            </div>
          </div>
          <div class="input-line">
            <s-input placeholder="0.00" v-model="amount" v-float class="s-input--token-value" />
            <div class="asset s-flex">
              <s-button class="asset-max" type="tertiary" size="small" border-radius="mini" @click="amount = asset.balance">
                {{ t('walletSend.max') }}
              </s-button>
              <i :class="getAssetClasses(asset.symbol)" />
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>
        </div>
        <div class="wallet-send-fee s-flex">
          <span>{{ t('walletSend.fee') }}</span>
          <span class="wallet-send-fee_value">0.001 XOR {{ /* TODO: for now it's a static field; add real numbers later */ }}</span>
        </div>
        <s-button class="wallet-send-action" type="primary" :disabled="!validAddress || !valudAmount" @click="step = 2">
          <template v-if="!validAddress">
            {{ t('walletSend.noAddress') }}
          </template>
          <template v-else-if="!valudAmount">
            {{ t('walletSend.insufficientBalance') }}
          </template>
          <template v-else>
            {{ t('walletSend.title') }}
          </template>
        </s-button>
      </template>
      <template v-else>
        <div class="confirm">
          <div class="confirm-asset s-flex">
            <span class="confirm-asset-title">{{ amount }}</span>
            <div class="confirm-asset-value s-flex">
              <i :class="getAssetClasses(asset.symbol)" />
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>
          <div class="confirm-from">{{ account.address }}</div>
          <s-icon name="arrow-bottom-rounded" />
          <div class="confirm-to">{{ address }}</div>
          <s-divider />
          <div class="wallet-send-fee s-flex">
            <span>{{ t('walletSend.fee') }}</span>
            <span class="wallet-send-fee_value">0.001 XOR {{ /* TODO: for now it's a static field; add real numbers later */ }}</span>
          </div>
        </div>
        <s-button class="wallet-send-action" type="primary" @click="handleSend">
          {{ t('walletSend.confirm') }}
        </s-button>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { AccountAsset } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'
import { getAssetIconClasses } from '../util'
import { dexApi } from '../api'

@Component({
  components: {
    WalletBase
  }
})
export default class WalletSend extends Mixins(TranslationMixin) {
  @Getter currentRouteParams!: any
  @Getter account!: any
  @Action navigate
  @Action transfer

  step = 1
  address = ''
  amount = ''

  get asset (): AccountAsset {
    return this.currentRouteParams.asset
  }

  get validAddress (): boolean {
    if (!this.address.trim()) {
      return false
    }
    return true // TODO: add check address function, also it should include from === to check
  }

  get valudAmount (): boolean {
    const amount = Number(this.amount)
    return amount > 0 && amount <= Number(this.asset.balance)
  }

  getAssetClasses = getAssetIconClasses

  handleBack (): void {
    if (this.step !== 1) {
      this.step = 1
      return
    }
    this.navigate({ name: RouteNames.Wallet })
  }

  async handleSend (): Promise<void> {
    try {
      await this.transfer({ to: this.address, amount: this.amount })
      this.navigate({ name: RouteNames.Wallet })
    } catch (error) {
      this.$alert(this.t(error.message), this.t('errorText'))
    }
  }
}
</script>

<style lang="scss">
.wallet-send {
  $swap-input-class: ".el-input";
  .s-input--token-value {
    min-height: 0;
    font-feature-settings: $s-font-feature-settings-input;
    #{$swap-input-class} {
      #{$swap-input-class}__inner {
        padding-top: 0;
      }
    }
    #{$swap-input-class}__inner {
      height: var(--s-size-small);
      padding-right: 0;
      padding-left: 0;
      border-radius: 0;
      color: var(--s-color-base-content-primary);
      font-size: 20px;
      line-height: 1.3;
      &, &:hover, &:focus {
        background-color: var(--s-color-base-background);
        border-color: var(--s-color-base-background);
      }
      &:disabled {
        color: var(--s-color-base-content-tertiary);
      }
      &:not(:disabled) {
        &:hover, &:focus {
          color: var(--s-color-base-content-primary);
        }
      }
    }
    .s-placeholder {
      display: none;
    }
  }
}
</style>

<style scoped lang="scss">
@import '../styles/icons';

// TODO: fix typography issues here
.wallet-send {
  .asset {
    &-balance {
      margin-left: auto;
      &-title {
        color: var(--s-color-base-content-tertiary);
        font-size: var(--s-font-size-mini);
      }
      &-value {
        margin-left: $basic-spacing_mini / 2;
        font-feature-settings: $s-font-feature-settings-common;
        letter-spacing: $s-letter-spacing-big;
      }
    }
    &-logo {
      @include asset-logo-styles;
      $logo-size: 24px;
      width: $logo-size;
      height: $logo-size;
      margin: $basic-spacing_mini / 2 $basic-spacing_mini;
    }
    &-name {
      line-height: 2.29;
      margin-right: $basic-spacing_mini;
    }
    &-max {
      margin-left: $basic-spacing_mini;
    }
    &-max, &-name {
      font-feature-settings: $s-font-feature-settings-title;
      @include font-weight(700, true);
    }
  }
  &-address {
    margin-bottom: $basic-spacing;
  }
  &-amount {
    position: relative;
    padding: $basic-spacing_small $basic-spacing_mini $basic-spacing_mini $basic-spacing;
    width: 100%;
    background-color: var(--s-color-base-background);
    border-radius: var(--s-border-radius-mini);
    .input-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      + .input-line {
        margin-top: $basic-spacing_small;
      }
      &-title,
      &-balance {
        display: inline-flex;
        align-items: baseline;
      }
      &-title {
        @include font-weight(600);
      }
      &-balance {
        padding-right: $basic-spacing_mini;
      }
    }
  }
  &-fee {
    align-items: center;
    margin-top: $basic-spacing_mini;
    margin-bottom: $basic-spacing;
    width: 100%;
    padding-right: $basic-spacing_mini;
    padding-left: $basic-spacing_mini;
    color: var(--s-color-base-content-secondary);
    &_value {
      margin-left: auto;
      font-feature-settings: $s-font-feature-settings-common;
    }
  }
  &-action {
    width: 100%;
  }
  .confirm {
    &-asset {
      margin-bottom: $basic-spacing;
      font-size: 30px;
      @include font-weight(400);
      &-title {
        line-height: 1.33;
        flex: 1;
      }
      &-value {
        .asset {
          &-logo {
            $logo-size: 40px;
            width: $logo-size;
            height: $logo-size;
            margin: 0 $basic-spacing_mini;
          }
          &-name {
            line-height: 1.33;
            @include font-weight(400, true);
          }
        }
      }
    }
    &-from {
      margin-bottom: $basic-spacing_mini;
    }
    &-to {
      margin-top: $basic-spacing_mini;
    }
    &-from, &-to {
      // It's set to small size cuz we need to show full address
      font-size: $font-size_small;
      @include font-weight(600);
    }
  }
}
</style>
