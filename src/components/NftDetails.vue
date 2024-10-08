<template>
  <div class="nft-details-container">
    <div class="preview-image-confirm-nft">
      <div v-if="imageLoading" v-loading="imageLoading" />
      <div v-else-if="badLink" class="placeholder">
        <s-icon
          v-if="isAssetDetails && !isNotImage"
          v-button
          class="preview-image-confirm-nft__icon-refresh"
          name="refresh-16"
          size="64px"
          @click.native="handleRefresh"
        />
        <span class="preview-image-confirm-nft__placeholder">{{
          t('createToken.nft.image.placeholderBadSource')
        }}</span>
        <span v-if="isAssetDetails" class="preview-image-confirm-nft__placeholder">{{
          t('createToken.nft.image.placeholderBadSourceAddition')
        }}</span>
      </div>
      <s-image v-else class="preview-image-confirm-nft__content" :src="image" fit="cover" :src-list="imagePreview" />
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

const UrlCreator = window.URL || window.webkitURL;

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
  isNotImage = false;
  image = '';

  get nftDetailsSectionClasses(): Array<string> {
    const cssClasses: Array<string> = ['nft-info__header--clickable'];
    if (this.nftDetailsClicked) {
      cssClasses.push('nft-info__header--clicked');
    }
    return cssClasses;
  }

  get imagePreview(): Array<string> {
    return [this.image];
  }

  private async checkImageAvailability(): Promise<void> {
    if (!this.contentLink) {
      return;
    }

    try {
      const response = await fetch(this.contentLink);
      const buffer = await response.blob();

      if (!buffer.type.startsWith('image/')) {
        this.isNotImage = true;
        this.badLink = true;
        this.imageLoading = false;
        return;
      }
      this.imageLoading = false;
      this.image = UrlCreator.createObjectURL(buffer);
    } catch {
      this.badLink = true;
    }
  }

  handleDetailsClick(): void {
    this.nftDetailsClicked = !this.nftDetailsClicked;
    this.$emit('click-details');
  }

  handleRefresh(): void {
    this.badLink = false;
    this.imageLoading = true;
    this.checkImageAvailability();
  }

  async mounted(): Promise<void> {
    await this.$nextTick();
    this.checkImageAvailability();
  }

  beforeDestroy(): void {
    if (this.image) {
      UrlCreator.revokeObjectURL(this.image);
    }
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
    height: 250px !important;
    width: 250px !important;
    object-fit: cover;
    border-radius: calc(var(--s-border-radius-mini) * 0.75);
  }

  &__icon-refresh {
    color: var(--s-color-base-content-tertiary) !important;
    font-size: var(--s-size-small) !important;
    margin-bottom: calc(var(--s-size-small) / 2);
    cursor: pointer;
    &:hover {
      color: var(--s-color-base-content-secondary) !important;
    }
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
    font-size: var(--s-font-size-large);
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
