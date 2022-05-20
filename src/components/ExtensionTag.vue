<template>
  <div class="extension-tag">
    <span v-if="hasIcon(extension)" :class="['extension-tag-icon', extension]" />
    <span class="extension-tag-name">{{ getName(extension) }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Extensions } from '../consts';

const ExtensionNames = {
  [Extensions.PolkadotJS]: 'polkadot{.js}',
  [Extensions.SubwalletJS]: 'SubWallet',
};

@Component
export default class ExtensionTag extends Vue {
  @Prop({ default: '', type: String }) readonly extension!: string;

  hasIcon(extension: string): boolean {
    return Object.values(Extensions).includes(extension as Extensions);
  }

  getName(extension: string): string {
    return ExtensionNames[extension] || extension;
  }
}
</script>

<style lang="scss" scoped>
$extensions: 'polkadot-js', 'subwallet-js';

.extension-tag {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  background: var(--s-color-utility-surface);
  border-radius: calc(var(--s-border-radius-mini) / 2);
  box-shadow: var(--s-shadow-element-pressed);
  font-size: var(--s-font-size-mini);
  line-height: var(--s-line-height-medium);
  letter-spacing: var(--s-letter-spacing-small);
  padding: 2px 6px;

  &-icon {
    height: var(--s-icon-font-size-mini);
    width: var(--s-icon-font-size-mini);
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    margin-right: $basic-spacing-mini;

    @each $extension in $extensions {
      &.#{$extension} {
        background-image: url('~@/assets/img/extensions/#{$extension}.png');
      }
    }
  }
}
</style>
