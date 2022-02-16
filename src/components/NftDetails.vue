<template>
  <div class="nft-details-container">
    <div class="preview-image-confirm-nft">
      <div v-if="imageLoading" v-loading="imageLoading" />
      <div v-else-if="badLink" class="placeholder">
        <s-icon class="preview-image-confirm-nft__icon" name="basic-clear-X-24" size="64px" />
        <span class="preview-image-confirm-nft__placeholder">{{
          t('createToken.nft.image.placeholderBadSource')
        }}</span>
        <span v-if="isAssetDetails" class="preview-image-confirm-nft__placeholder">{{
          t('createToken.nft.image.placeholderBadSourceAddition')
        }}</span>
      </div>
      <img v-else class="preview-image-confirm-nft__content" :src="contentLink" />
    </div>
    <div class="nft-info">
      <div class="nft-info__header">
        <div v-if="isAssetDetails" :class="nftDetailsSectionClasses" @click="handleDetailsClick">
          <span>{{ tokenSymbol }}</span>
          <s-icon name="chevron-down-rounded-16" size="18" />
        </div>
        <template v-else>
          <span class="nft-info__name">{{ tokenName }}</span>
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
    const cssClasses: Array<string> = ['nft-info__header--clickable'];
    if (this.nftDetailsClicked) {
      cssClasses.push('nft-info__header--clicked');
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

<style lang="scss">
.preview-image-confirm-nft {
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-bottom: var(--s-size-mini);
  height: 250px;

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__content {
    margin: 0 auto;
    height: 250px;
    width: 250px;
    object-fit: cover;
    border-radius: calc(var(--s-border-radius-mini) * 0.75);
  }

  &__icon {
    color: var(--s-color-base-content-tertiary) !important;
    font-size: var(--s-size-small) !important;
    margin-bottom: calc(var(--s-size-small) / 2);
  }

  &__placeholder {
    letter-spacing: var(--s-letter-spacing-small);
    color: var(--s-color-base-content-primary);
    font-size: calc(var(--s-size-small) / 2);
    text-align: center;
    padding: 0 50px;
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

  &__header {
    font-weight: 700;
    font-size: 24px;
    text-transform: capitalize;

    &--clickable {
      cursor: pointer;
    }

    .s-icon-chevron-down-rounded-16 {
      display: inline-block;
      margin-left: var(--s-basic-spacing);
      height: var(--s-icon-font-size-small);
      width: var(--s-icon-font-size-small);
      transition: transform 0.3s;
      background-color: var(--s-color-base-content-secondary);
      color: var(--s-color-base-on-accent) !important;
      border-radius: 50%;
      text-align: left;
    }

    &--clicked .s-icon-chevron-down-rounded-16 {
      padding-right: #{$basic-spacing-small};
      transform: rotate(180deg);
    }
  }

  &__name {
    display: inline-block;
    max-width: 220px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 6px;
    line-height: var(--s-size-mini);
  }

  &__symbol {
    display: inline-block;
    font-weight: 400;
    overflow: hidden;
    font-size: calc(var(--s-size-small) / 2);
    color: var(--s-color-brand-day);
    line-height: calc(var(--s-size-mini) / 1.2);
  }

  &__desc {
    font-size: 14px;
    color: var(--s-color-brand-day);
    text-align: center;
    margin-bottom: 10px;
    max-width: 100%;
    overflow: hidden;
  }

  &__supply {
    border-top: 1px solid var(--s-color-base-border-secondary);
    padding-top: 10px;
    border-bottom: none;
    margin-bottom: 20px;
  }
}
</style>
