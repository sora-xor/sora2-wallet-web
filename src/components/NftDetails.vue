<template>
  <div class="nft-details-container">
    <div class="preview-image">
      <div v-if="imageLoading" v-loading="imageLoading" />
      <div v-else-if="badLink" class="placeholder">
        <s-icon class="preview-image__icon" name="basic-clear-X-24" size="64px" />
        <span class="preview-image__placeholder">{{ t('createToken.nft.image.placeholderBadSource') }}</span>
        <span v-if="isAssetDetails" class="preview-image__placeholder">{{
          t('createToken.nft.image.placeholderBadSourceAddition')
        }}</span>
      </div>
      <img v-else class="preview-image__content" :src="contentLink" />
    </div>
    <div class="nft-info">
      <div class="nft-info__name">
        <div v-if="isAssetDetails" :class="nftDetailsSectionClasses" @click="handleDetailsClick">
          <span>{{ tokenSymbol }}</span>
          <s-icon name="chevron-down-rounded-16" size="18" />
        </div>
        <template v-else>
          {{ tokenName /* TODO: [NFT] name should be cropped via styles */ }}
          <span class="nft-info__symbol">{{ tokenSymbol }}</span>
        </template>
      </div>
      <div class="nft-info__desc">{{ tokenDescription }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';

@Component
export default class NftDetails extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly contentLink!: string;
  @Prop({ default: '', type: String }) readonly tokenName!: string;
  @Prop({ default: '', type: String }) readonly tokenSymbol!: string;
  @Prop({ default: '', type: String }) readonly tokenDescription!: string;
  @Prop({ default: false, type: Boolean }) readonly isAssetDetails!: boolean;

  private nftDetailsClicked = false;
  badLink = false;
  imageLoading = true;

  get nftDetailsSectionClasses(): Array<string> {
    const cssClasses: Array<string> = ['nft-info__name--clickable'];
    if (this.nftDetailsClicked) {
      cssClasses.push('nft-info__name--clicked');
    }
    return cssClasses;
  }

  async checkImageAvailability(): Promise<void> {
    if (!this.contentLink) return;
    const response = await fetch(this.contentLink);
    const buffer = await response.blob();
    this.imageLoading = false;
    this.badLink = !buffer.type.startsWith('image/');
  }

  handleDetailsClick(): void {
    this.nftDetailsClicked = !this.nftDetailsClicked;
    this.$emit('click-details');
  }

  beforeUpdate(): void {
    this.checkImageAvailability();
  }

  mounted(): void {
    this.checkImageAvailability();
  }
}
</script>

<style lang="scss" scoped>
.preview-image {
  border: none;
  height: 250px;

  &__content {
    margin: 0 auto;
    height: 250px;
    width: 250px;
  }
}

.nft-details-container {
  width: 100%;
}

.nft-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &__name {
    font-weight: 700;
    font-size: 24px;
    text-transform: capitalize;

    &--clickable {
      cursor: pointer;
    }

    &--clicked .s-icon-chevron-down-rounded-16 {
      padding-right: #{$basic-spacing-small};
      transform: rotate(180deg);
    }
  }

  &__symbol {
    font-weight: 400;
    font-size: calc(var(--s-size-small) / 2);
    color: var(--s-color-brand-day);
  }

  &__desc {
    font-size: 14px;
    color: var(--s-color-brand-day);
    text-align: center;
    margin-bottom: 10px;
  }

  &__supply {
    border-top: 1px solid var(--s-color-base-border-secondary);
    padding-top: 10px;
    border-bottom: none;
    margin-bottom: 20px;
  }
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
</style>
