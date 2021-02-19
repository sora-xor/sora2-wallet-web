<template>
  <wallet-base :title="t('createToken.title')" show-back @back="handleBack">
    <div class="wallet-settings-create-token">
      <template v-if="step === STEPS.Create">
        <s-input
          :placeholder="t(`createToken.tokenSymbol.placeholder`)"
          :minlength="1"
          :maxlength="7"
          v-maska="tokenSymbolMask"
          v-model="tokenSymbol"
        />
        <p class="wallet-settings-create-token_desc">{{ t(`createToken.tokenSymbol.desc`) }}</p>
        <s-input
          :placeholder="t(`createToken.tokenSupply.placeholder`)"
          v-maska="tokenSupplyMask"
          v-model="tokenSupply"
        />
        <p class="wallet-settings-create-token_desc">{{ t(`createToken.tokenSupply.desc`) }}</p>
        <div class="wallet-settings-create-token_supply-block">
          <span>{{ t(`createToken.extensibleSupply.placeholder`) }}</span>
          <s-switch v-model="extensibleSupply" />
        </div>
        <s-button class="wallet-settings-create-token_action" @click="onConfirm" type="primary">{{ t('createToken.action') }}</s-button>
      </template>
      <template v-else-if="step === STEPS.Confirm">
        <div class="wallet-settings-create-token_confirm-block">
          <span>{{ t('createToken.tokenSymbol.placeholder') }}</span>
          <span>{{ tokenSymbol }}</span>
        </div>
        <div class="wallet-settings-create-token_confirm-block">
          <span>{{ t('createToken.tokenSupply.placeholder') }}</span>
          <span>{{ tokenSupply }}</span>
        </div>
        <div class="wallet-settings-create-token_confirm-block">
          <span>{{ t('createToken.extensibleSupply.placeholder') }}</span>
          <span>{{ extensibleSupply ? 'Yes' : 'No' }}</span>
        </div>
        <s-divider class="wallet-settings-create-token_divider" />
        <div class="wallet-settings-create-token_confirm-block">
          <div class="wallet-settings-create-token_fee-block">
            <s-tooltip class="bridge-info-icon" popper-class="info-tooltip info-tooltip--bridge" border-radius="mini" :content="t('createToken.tooltipValue')" theme="light" placement="right-start" animation="none" :show-arrow="false">
              <s-icon name="info" size="16" />
            </s-tooltip>
            <span class="wallet-settings-create-token_fee-block_title">{{ t('createToken.fee') }}</span>
          </div>
          <span>{{ fee }} {{ KnownSymbols.XOR }}</span>
        </div>
        <s-button class="wallet-settings-create-token_action" @click="onCreate" type="primary">{{ t('createToken.confirm') }}</s-button>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'
import { api } from '../api'
import { KnownSymbols } from '@sora-substrate/util'

enum STEPS {
  Create,
  Confirm
}

@Component({
  components: {
    WalletBase
  }
})
export default class CreateToken extends Mixins(TranslationMixin) {
  readonly KnownSymbols = KnownSymbols
  readonly STEPS = STEPS

  step = this.STEPS.Create
  tokenSymbol = ''
  tokenSupply = ''
  extensibleSupply = false
  fee = '0.0'

  tokenSymbolMask = 'AAAAAAA'
  tokenSupplyMask = { mask: 'N#*', tokens: { N: { pattern: /[1-9]/ } } }

  @Action navigate

  handleBack (): void {
    if (this.step === this.STEPS.Create) {
      this.navigate({ name: RouteNames.WalletSettingsAdvanced })
    } else {
      this.step = this.STEPS.Create
    }
  }

  async calculateFee (): Promise<string> {
    console.log(
      this.tokenSymbol, this.tokenSupply, this.extensibleSupply
    )
    return api.getRegisterAssetNetworkFee(
      this.tokenSymbol,
      this.tokenSupply,
      this.extensibleSupply
    )
  }

  async registerAsset (): Promise<void> {
    return api.registerAsset(
      this.tokenSymbol,
      this.tokenSupply,
      this.extensibleSupply
    )
  }

  async onConfirm (): Promise<void> {
    if (this.tokenSymbol.length > 0 && this.tokenSupply.length > 0) {
      try {
        this.fee = await this.calculateFee()
        this.step = this.STEPS.Confirm
      } catch (error) {
        console.error(error)
        this.$notify({
          message: this.t('createToken.feeError'),
          type: 'error',
          title: ''
        })
      }
    }
  }

  async onCreate (): Promise<void> {
    try {
      await this.registerAsset()
      this.$notify({
        type: 'info',
        title: this.t('createToken.success.title'),
        message: this.t('createToken.success.desc', { symbol: this.tokenSymbol })
      })
      this.navigate({ name: RouteNames.Wallet })
    } catch (error) {
      console.error(error)
      this.$notify({
        type: 'error',
        title: '',
        message: this.t('createToken.error', { symbol: this.tokenSymbol })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.wallet-settings-create-token {
  &_desc {
    color: var(--s-color-base-content-secondary);
    font-size: $font-size_small;
    padding: $basic-spacing_mini 0 $basic-spacing 0;
    line-height: $line-height_medium;
    font-feature-settings: $s-font-feature-settings-common;
  }
  &_supply-block {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background: var(--s-color-base-background);
    padding: $basic-spacing_small $basic-spacing;
    border-radius: $basic-spacing_mini;
    margin-bottom: $basic-spacing;
  }
  &_action {
    width: 100%;
  }
  &_confirm-block {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--s-color-base-content-secondary);
    font-size: $font-size_basic;
    font-weight: normal;
    padding: $basic-spacing_mini 0;
    line-height: $line-height_medium;
    font-feature-settings: $s-font-feature-settings-common;
  }
  &_fee-block {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  &_fee-block_title {
    margin-left: $basic-spacing_mini;
    line-height: 1;
  }
  &_divider {
    margin: unset;
  }
}
</style>
