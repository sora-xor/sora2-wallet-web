<template>
  <wallet-base :title="t('createToken.title')" show-back @back="handleBack">
    <div class="wallet-settings-create-token">
      <template v-if="step === Step.Create">
        <s-input
          :placeholder="t('createToken.tokenSymbol.placeholder')"
          :minlength="1"
          :maxlength="7"
          :disabled="loading"
          v-maska="tokenSymbolMask"
          v-model="tokenSymbol"
        />
        <p class="wallet-settings-create-token_desc">{{ t('createToken.tokenSymbol.desc') }}</p>
        <s-input
          :placeholder="t('createToken.tokenName.placeholder')"
          :minlength="1"
          :maxlength="33"
          :disabled="loading"
          v-maska="tokenNameMask"
          v-model="tokenName"
        />
        <p class="wallet-settings-create-token_desc">{{ t('createToken.tokenName.desc') }}</p>
        <s-float-input
          v-model="tokenSupply"
          :placeholder="t('createToken.tokenSupply.placeholder')"
          :decimals="decimals"
          has-locale-string
          :delimiters="delimiters"
          :max="maxTotalSupply"
          :disabled="loading"
        />
        <p class="wallet-settings-create-token_desc">{{ t('createToken.tokenSupply.desc') }}</p>
        <div class="wallet-settings-create-token_supply-block">
          <s-switch v-model="extensibleSupply" :disabled="loading" />
          <span>{{ t('createToken.extensibleSupply.placeholder') }}</span>
        </div>
        <p class="wallet-settings-create-token_desc">{{ t('createToken.extensibleSupply.desc') }}</p>
        <s-button
          class="wallet-settings-create-token_action s-typography-button--large"
          type="primary"
          :loading="loading"
          :disabled="isCreateDisabled"
          @click="onConfirm"
        >
          <template v-if="!tokenSymbol">{{ t('createToken.enterSymbol') }}</template>
          <template v-else-if="!tokenName.trim()">{{ t('createToken.enterName') }}</template>
          <template v-else-if="!tokenSupply">{{ t('createToken.enterSupply') }}</template>
          <template v-else>{{ t('createToken.action') }}</template>
        </s-button>
      </template>
      <template v-else-if="step === Step.Confirm">
        <info-line :label="t('createToken.tokenSymbol.placeholder')" :value="tokenSymbol" />
        <info-line :label="t('createToken.tokenName.placeholder')" :value="tokenName.trim()" />
        <info-line :label="t('createToken.tokenSupply.placeholder')" :value="formattedTokenSupply" />
        <info-line :label="t('createToken.extensibleSupply.placeholder')" :value="extensibleSupply ? 'Yes' : 'No'" />
        <s-button
          class="wallet-settings-create-token_action s-typography-button--large"
          type="primary"
          :disabled="!hasEnoughXor"
          :loading="loading"
          @click="onCreate"
        >
          <template v-if="!hasEnoughXor">{{ t('createToken.insufficientBalance', { symbol: KnownSymbols.XOR }) }}</template>
          <template v-else>{{ t('createToken.confirm') }}</template>
        </s-button>
      </template>
      <wallet-fee v-if="!isCreateDisabled" :value="fee" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { KnownSymbols, KnownAssets, FPNumber, MaxTotalSupply, Operation } from '@sora-substrate/util'

import TransactionMixin from './mixins/TransactionMixin'
import NumberFormatterMixin from './mixins/NumberFormatterMixin'
import WalletBase from './WalletBase.vue'
import InfoLine from './InfoLine.vue'
import WalletFee from './WalletFee.vue'
import { RouteNames } from '../consts'
import { api } from '../api'

enum Step {
  Create,
  Confirm
}

@Component({
  components: {
    WalletBase,
    InfoLine,
    WalletFee
  }
})
export default class CreateToken extends Mixins(TransactionMixin, NumberFormatterMixin) {
  readonly KnownSymbols = KnownSymbols
  readonly Step = Step
  readonly decimals = FPNumber.DEFAULT_PRECISION
  readonly delimiters = FPNumber.DELIMITERS_CONFIG
  readonly maxTotalSupply = MaxTotalSupply
  readonly tokenSymbolMask = 'AAAAAAA'
  readonly tokenNameMask = { mask: 'Z*', tokens: { Z: { pattern: /[0-9a-zA-Z ]/ } } }

  step = Step.Create
  tokenSymbol = ''
  tokenName = ''
  tokenSupply = ''
  extensibleSupply = false

  @Getter networkFees!: any
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>

  handleBack (): void {
    if (this.step === Step.Create) {
      this.navigate({ name: RouteNames.Wallet })
    } else {
      this.step = Step.Create
    }
  }

  get fee (): FPNumber {
    return this.getFPNumberFromCodec(this.networkFees[Operation.RegisterAsset])
  }

  get isCreateDisabled (): boolean {
    return !(this.tokenSymbol && this.tokenName.trim() && this.tokenSupply)
  }

  get formattedTokenSupply (): string {
    return this.formatStringValue(this.tokenSupply, this.decimals)
  }

  get hasEnoughXor (): boolean {
    const xor = KnownAssets.get(KnownSymbols.XOR)
    const accountXor = api.accountAssets.find(asset => asset.address === xor.address)
    if (!accountXor || !accountXor.balance || !+accountXor.balance.transferable) {
      return false
    }
    const fpAccountXor = this.getFPNumberFromCodec(accountXor.balance.transferable, accountXor.decimals)
    return FPNumber.gte(fpAccountXor, this.fee)
  }

  async registerAsset (): Promise<void> {
    return api.registerAsset(
      this.tokenSymbol,
      this.tokenName.trim(),
      this.tokenSupply,
      this.extensibleSupply
    )
  }

  async onConfirm (): Promise<void> {
    if (!this.tokenSymbol.length || !this.tokenSupply.length) {
      return
    }
    const tokenSupply = this.getFPNumber(this.tokenSupply, this.decimals)
    const maxTokenSupply = this.getFPNumber(MaxTotalSupply, this.decimals)
    if (FPNumber.gt(tokenSupply, maxTokenSupply)) {
      this.tokenSupply = maxTokenSupply.toString()
    }
    this.step = Step.Confirm
  }

  async onCreate (): Promise<void> {
    await this.withNotifications(
      async () => {
        if (!this.hasEnoughXor) {
          throw new Error('walletSend.badAmount')
        }
        await this.registerAsset()
        this.navigate({ name: RouteNames.Wallet })
      }
    )
  }
}
</script>

<style scoped lang="scss">
.wallet-settings-create-token {
  &_desc {
    color: var(--s-color-base-content-primary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    padding: var(--s-basic-spacing) #{$basic-spacing-small} #{$basic-spacing-medium};
  }
  &_supply-block {
    @include switch-block;
    padding: 0 #{$basic-spacing-small};
  }
  &_action {
    margin-top: #{$basic-spacing-medium};
    width: 100%;
  }
  &_divider {
    margin: unset;
  }
}
</style>
