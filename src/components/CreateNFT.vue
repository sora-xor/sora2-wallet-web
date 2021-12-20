<template>
  <div>
    <s-input
      :placeholder="linkPlaceholder"
      :minlength="1"
      :maxlength="50"
      :disabled="loading"
      v-model="link"
      @input="inputLinkChange"
    />
    <div class="preview-image">
      <div class="preview-image__icon" />
      <span class="preview-image__placeholder">{{ t('createToken.nft.image.placeholder') }}</span>
    </div>
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
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import TranslationMixin from '../components/mixins/TranslationMixin';
import LoadingMixin from '../components/mixins/LoadingMixin';
import { MaxTotalSupply, FPNumber } from '@sora-substrate/util';

@Component
export default class CreateNFT extends Mixins(TranslationMixin, LoadingMixin) {
  readonly tokenSymbolMask = 'AAAAA';
  readonly tokenNameMask = { mask: 'Z*', tokens: { Z: { pattern: /[0-9a-zA-Z ]/ } } };
  readonly maxTotalSupply = MaxTotalSupply;
  readonly decimals = FPNumber.DEFAULT_PRECISION;
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;

  link = '';
  tokenSymbol = '';
  tokenName = '';
  tokenSupply = '';
  linkPlaceholder = this.t('createToken.nft.link.placeholder');

  inputLinkChange(value): void {
    this.linkPlaceholder = value
      ? this.t('createToken.nft.link.placeholderShort')
      : this.t('createToken.nft.link.placeholder');
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
    background: url('~@/assets/img/nft-image-placeholder.svg') no-repeat;
    height: var(--s-size-medium);
    width: var(--s-size-medium);
  }

  &__placeholder {
    letter-spacing: var(--s-letter-spacing-small);
    color: var(--s-color-base-content-secondary);
    font-weight: 300 !important;
  }
}
</style>
