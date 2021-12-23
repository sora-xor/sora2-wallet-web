<template>
  <div>
    <s-input
      :placeholder="linkPlaceholder"
      :minlength="1"
      :maxlength="50"
      :disabled="loading"
      v-model="contentLink"
      @input="inputLinkChange"
    />
    <div class="preview-image">
      <div v-if="!contentLink" class="placeholder">
        <s-icon class="preview-image__icon" name="camera-16" size="64px" />
        <span class="preview-image__placeholder">{{ t('createToken.nft.image.placeholder') }}</span>
      </div>
      <img v-else :src="contentLink" />
    </div>
    <s-input
      :placeholder="t('createToken.nft.name.placeholder')"
      :minlength="1"
      :maxlength="33"
      :disabled="loading"
      v-maska="tokenNameMask"
      v-model="tokenName"
    />
    <p class="wallet-settings-create-token_desc">{{ t('createToken.nft.name.desc') }}</p>
    <s-input
      :placeholder="t('createToken.nft.symbol.placeholder')"
      :minlength="1"
      :maxlength="5"
      :disabled="loading"
      v-maska="tokenSymbolMask"
      v-model="tokenSymbol"
    />
    <p class="wallet-settings-create-token_desc">{{ t('createToken.nft.symbol.desc') }}</p>
    <s-input
      type="textarea"
      :value="String('Description')"
      v-model="tokenDescription"
      :placeholder="t('createToken.nft.description.placeholder')"
    />
    <s-float-input
      v-model="tokenSupply"
      :placeholder="t('createToken.nft.supply.placeholder')"
      :decimals="decimals"
      has-locale-string
      :delimiters="delimiters"
      :max="maxTotalSupply"
      :disabled="loading"
    />
    <p class="wallet-settings-create-token_desc">{{ t('createToken.nft.supply.desc') }}</p>
    <s-button
      class="wallet-settings-create-token_action s-typography-button--large"
      type="primary"
      :loading="loading"
      :disabled="isCreateDisabled"
      @click="onConfirm"
    >
      <template v-if="!contentLink.trim()">{{ t('createToken.enterLink') }}</template>
      <template v-else-if="!tokenName.trim()">{{ t('createToken.enterName') }}</template>
      <template v-else-if="!tokenSymbol">{{ t('createToken.enterSymbol') }}</template>
      <template v-else-if="!tokenDescription">{{ t('createToken.enterTokenDescription') }}</template>
      <template v-else-if="!tokenSupply">{{ t('createToken.enterSupply') }}</template>
      <template v-else>{{ t('createToken.actionNFT') }}</template>
    </s-button>
    <wallet-fee v-if="!isCreateDisabled" :value="fee" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import TranslationMixin from '../components/mixins/TranslationMixin';
import NetworkFeeWarningMixin from './mixins/NetworkFeeWarningMixin';
import LoadingMixin from '../components/mixins/LoadingMixin';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';
import { MaxTotalSupply, FPNumber } from '@sora-substrate/util';
import InfoLine from './InfoLine.vue';
import WalletFee from './WalletFee.vue';

@Component({
  components: {
    InfoLine,
    WalletFee,
  },
})
export default class CreateNFT extends Mixins(
  TranslationMixin,
  LoadingMixin,
  NumberFormatterMixin,
  NetworkFeeWarningMixin
) {
  readonly tokenSymbolMask = 'AAAAA';
  readonly tokenNameMask = { mask: 'Z*', tokens: { Z: { pattern: /[0-9a-zA-Z ]/ } } };
  readonly maxTotalSupply = MaxTotalSupply;
  readonly decimals = FPNumber.DEFAULT_PRECISION;
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;

  contentLink = '';
  tokenSymbol = '';
  tokenName = '';
  tokenDescription = '';
  tokenSupply = '';
  linkPlaceholder = this.t('createToken.nft.link.placeholder');

  get isCreateDisabled(): boolean {
    return !(this.contentLink.trim() && this.tokenSymbol && this.tokenName.trim() && this.tokenSupply);
  }

  get fee(): FPNumber {
    return this.getFPNumberFromCodec(this.networkFees.RegisterAsset);
  }

  inputLinkChange(value): void {
    this.linkPlaceholder = value
      ? this.t('createToken.nft.link.placeholderShort')
      : this.t('createToken.nft.link.placeholder');
  }

  onConfirm(): void {
    console.log('clicked');
  }
}
</script>

<style lang="scss">
.wallet-settings-create-token {
  &_desc {
    color: var(--s-color-base-content-primary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    padding: var(--s-basic-spacing) #{$basic-spacing-small} #{$basic-spacing-medium};
  }

  &_action {
    margin-top: #{$basic-spacing-medium};
    width: 100%;
  }
}

.s-textarea {
  margin-bottom: #{$basic-spacing-medium};
}

.el-textarea__inner {
  resize: none !important;
}

.preview-image {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: var(--s-color-base-background);
  box-shadow: var(--s-shadow-element);
  border-radius: var(--s-border-radius-small);
  margin: #{$basic-spacing-medium} 0;
  height: 200px;

  &__icon {
    color: var(--s-color-base-content-tertiary) !important;
    font-size: var(--s-size-small) !important;
    margin-bottom: calc(var(--s-size-small) / 2);
  }

  &__placeholder {
    letter-spacing: var(--s-letter-spacing-small);
    color: var(--s-color-base-content-secondary);
    font-weight: 300 !important;
  }
}
</style>
