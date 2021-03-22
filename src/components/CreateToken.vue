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
              <s-icon name="info-16" />
            </s-tooltip>
            <span class="wallet-settings-create-token_fee-block_title">{{ t('createToken.fee') }}</span>
          </div>
          <span>{{ formattedFee }} {{ KnownSymbols.XOR }}</span>
        </div>
        <s-button
          class="wallet-settings-create-token_action"
          type="primary"
          :disabled="!hasEnoughXor"
          @click="onCreate"
        >
          <template v-if="!hasEnoughXor">{{ t('createToken.insufficientBalance', { symbol: KnownSymbols.XOR }) }}</template>
          <template v-else>{{ t('createToken.confirm') }}</template>
        </s-button>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { KnownSymbols, CodecString, KnownAssets, FPNumber } from '@sora-substrate/util'

import TransactionMixin from './mixins/TransactionMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'
import { api } from '../api'

enum STEPS {
  Create,
  Confirm
}

@Component({
  components: {
    WalletBase
  }
})
export default class CreateToken extends Mixins(TransactionMixin) {
  readonly KnownSymbols = KnownSymbols
  readonly STEPS = STEPS

  step = this.STEPS.Create
  tokenSymbol = ''
  tokenSupply = ''
  extensibleSupply = false
  fee: CodecString = '0'

  tokenSymbolMask = 'AAAAAAA'
  tokenSupplyMask = { mask: 'N#*', tokens: { N: { pattern: /[1-9]/ } } }

  @Action navigate

  handleBack (): void {
    if (this.step === this.STEPS.Create) {
      this.navigate({ name: RouteNames.Wallet })
    } else {
      this.step = this.STEPS.Create
    }
  }

  get formattedFee (): string {
    return this.formatCodecNumber(this.fee)
  }

  get hasEnoughXor (): boolean {
    const xor = KnownAssets.get(KnownSymbols.XOR)
    const accountXor = api.accountAssets.find(asset => asset.address === xor.address)
    if (!accountXor || !+accountXor.balance) {
      return false
    }
    const fpAccountXor = this.getFPNumberFromCodec(accountXor.balance, accountXor.decimals)
    return FPNumber.gte(fpAccountXor, this.getFPNumberFromCodec(this.fee))
  }

  async calculateFee (): Promise<CodecString> {
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
    await this.withNotifications(
      async () => {
        if (!this.hasEnoughXor) {
          throw new Error('walletSend.badAmount')
        }
        await this.registerAsset()
      }
    )
    this.navigate({ name: RouteNames.Wallet })
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
    font-feature-settings: var(--s-font-feature-settings-common);
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
    font-feature-settings: var(--s-font-feature-settings-common);
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
