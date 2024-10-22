<template>
  <img
    v-show="asset.content && showNftImage"
    class="asset-logo nft-image"
    ref="nftImage"
    alt="NFT"
    :src="nftImageUrl"
    @load="handleNftImageLoad"
    @error="hideNftImage"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Ref } from 'vue-property-decorator';

import { IpfsStorage } from '../../util/ipfsStorage';

import type { Asset } from '@sora-substrate/sdk/build/assets/types';

@Component
export default class NftTokenLogo extends Vue {
  @Prop({ default: () => {}, type: Object, required: true }) readonly asset!: Asset;
  @Ref('nftImage') readonly nftImage!: HTMLImageElement;

  showNftImage = false;

  get nftImageUrl(): string {
    if (this.asset.content) {
      return IpfsStorage.constructFullIpfsUrl(this.asset.content);
    }
    return '';
  }

  handleNftImageLoad(): void {
    const imgElement = this.nftImage as HTMLImageElement;
    if (imgElement) {
      this.showNftImage = imgElement.complete && imgElement.naturalHeight !== 0;
    } else {
      this.showNftImage = false;
    }
  }

  hideNftImage(): void {
    this.showNftImage = false;
  }
}
</script>

<style></style>
