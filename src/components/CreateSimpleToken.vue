<template>
  <div class="wallet-settings-create-token">
    <template v-if="step === Step.CreateSimpleToken">
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
        @click="onCreate"
      >
        <template v-if="!tokenSymbol">{{ t('createToken.enterSymbol') }}</template>
        <template v-else-if="!tokenName.trim()">{{ t('createToken.enterName') }}</template>
        <template v-else-if="!+tokenSupply">{{ t('createToken.enterSupply') }}</template>
        <template v-else>{{ t('createToken.action') }}</template>
      </s-button>
    </template>
    <template v-else-if="step === Step.Warn">
      <network-fee-warning-dialog :fee="formattedFee" @confirm="confirmNextTxFailure" />
    </template>
    <template v-else-if="step === Step.ConfirmSimpleToken">
      <info-line :label="t('createToken.tokenSymbol.placeholder')" :value="tokenSymbol" />
      <info-line :label="t('createToken.tokenName.placeholder')" :value="tokenName.trim()" />
      <info-line :label="t('createToken.tokenSupply.placeholder')" :value="formattedTokenSupply" />
      <info-line :label="t('createToken.extensibleSupply.placeholder')" :value="extensibleSupply ? 'Yes' : 'No'" />
      <account-confirmation-option with-hint class="wallet-settings-create-token_action" />
      <s-button
        class="wallet-settings-create-token_action s-typography-button--large"
        type="primary"
        :disabled="!hasEnoughXor"
        :loading="loading"
        @click="onConfirm"
      >
        <template v-if="!hasEnoughXor">{{ t('createToken.insufficientBalance', { symbol: XOR }) }}</template>
        <template v-else>{{ t('createToken.confirm') }}</template>
      </s-button>
    </template>
    <wallet-fee v-if="!isCreateDisabled && showFee" :value="fee" />
  </div>
</template>

<script lang="ts">
import { FPNumber, Operation } from '@sora-substrate/util';
import { MaxTotalSupply, XOR } from '@sora-substrate/util/build/assets/consts';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../api';
import { RouteNames, Step } from '../consts';
import { mutation, state } from '../store/decorators';

import AccountConfirmationOption from './Account/Settings/ConfirmationOption.vue';
import InfoLine from './InfoLine.vue';
import NetworkFeeWarningMixin from './mixins/NetworkFeeWarningMixin';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';
import TransactionMixin from './mixins/TransactionMixin';
import NetworkFeeWarningDialog from './NetworkFeeWarning.vue';
import WalletBase from './WalletBase.vue';
import WalletFee from './WalletFee.vue';

import type { Route } from '../store/router/types';

@Component({
  components: {
    WalletBase,
    InfoLine,
    WalletFee,
    NetworkFeeWarningDialog,
    AccountConfirmationOption,
  },
})
export default class CreateSimpleToken extends Mixins(TransactionMixin, NumberFormatterMixin, NetworkFeeWarningMixin) {
  readonly XOR = XOR.symbol;
  readonly Step = Step;
  readonly decimals = FPNumber.DEFAULT_PRECISION;
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;
  readonly maxTotalSupply = MaxTotalSupply;
  readonly tokenSymbolMask = 'AAAAAAA';
  readonly tokenNameMask = { mask: 'Z*', tokens: { Z: { pattern: /[0-9a-zA-Z ]/ } } };

  @Prop({ default: Step.CreateSimpleToken, type: String }) readonly step!: Step;

  @mutation.router.navigate private navigate!: (options: Route) => void;
  @state.transactions.isConfirmTxDialogEnabled private isConfirmTxEnabled!: boolean;

  tokenSymbol = '';
  tokenName = '';
  tokenSupply = '';
  extensibleSupply = false;
  showFee = true;

  get fee(): FPNumber {
    return this.getFPNumberFromCodec(this.networkFees.RegisterAsset);
  }

  get formattedFee(): string {
    return this.fee.toLocaleString();
  }

  get isCreateDisabled(): boolean {
    return !(this.tokenSymbol && this.tokenName.trim() && +this.tokenSupply);
  }

  get formattedTokenSupply(): string {
    return this.formatStringValue(this.tokenSupply, this.decimals);
  }

  get hasEnoughXor(): boolean {
    const accountXor = api.assets.accountAssets.find((asset) => asset.address === XOR.address);
    if (!accountXor || !accountXor.balance || !+accountXor.balance.transferable) {
      return false;
    }
    const fpAccountXor = this.getFPNumberFromCodec(accountXor.balance.transferable, accountXor.decimals);
    return FPNumber.gte(fpAccountXor, this.fee);
  }

  async registerAsset(): Promise<void> {
    return api.assets.register(this.tokenSymbol, this.tokenName.trim(), this.tokenSupply, this.extensibleSupply);
  }

  async onCreate(): Promise<void> {
    if (!this.tokenSymbol.length || !this.tokenSupply.length || !this.tokenName.length) {
      return;
    }

    this.tokenSupply = this.getCorrectSupply(this.tokenSupply, this.decimals);

    this.$emit('showTabs');

    if (this.allowFeePopup && this.hasEnoughXor && !this.isXorSufficientForNextTx({ type: Operation.RegisterAsset })) {
      this.$emit('showHeader');
      this.showFee = false;
      this.$emit('stepChange', Step.Warn);
      return;
    }

    if (this.isConfirmTxEnabled) {
      this.showFee = true;
      this.$emit('stepChange', Step.ConfirmSimpleToken);
    } else {
      await this.onConfirm();
    }
  }

  async onConfirm(): Promise<void> {
    await this.withNotifications(async () => {
      if (!this.hasEnoughXor) {
        throw new Error('walletSend.badAmount');
      }
      await this.registerAsset();
      this.navigate({ name: RouteNames.Wallet });
    });
  }

  confirmNextTxFailure(): void {
    this.$emit('showHeader');
    this.showFee = true;
    this.$emit('stepChange', Step.ConfirmSimpleToken);
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
