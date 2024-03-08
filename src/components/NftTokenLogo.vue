<template>
  <img v-show="src" class="asset-logo nft-image" :alt="nftAlt" :src="src" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import { IpfsStorage } from '../util/ipfsStorage';

@Component
export default class NftTokenLogo extends Vue {
  @Prop({ default: '', type: String, required: true }) readonly link!: string;

  src = '';

  @Watch('link', { immediate: true })
  private async handleLinkUpdate(link?: string): Promise<void> {
    if (link) {
      const obj = await IpfsStorage.requestImage(link);
      this.src = (obj || {}).image || '';
    }
  }

  get nftAlt(): string {
    return `NFT icon: ${this.link}`;
  }
}
</script>
