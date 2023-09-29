<template>
  <s-tooltip :content="copyTooltip(tooltipText)" tabindex="-1">
    <div class="formatted-address" @click="handleCopyAddress(value, $event)">
      <span class="first" :style="{ width: firstPartWidth }">{{ value }}</span>
      ...
      <span>{{ secondPart }}</span>
    </div>
  </s-tooltip>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { getTextWidth } from '../../util';
import CopyAddressMixin from '../mixins/CopyAddressMixin';

@Component
export default class FormattedAddress extends Mixins(CopyAddressMixin) {
  @Prop({ default: '', type: String }) readonly value!: string;
  @Prop({ default: '', type: String }) readonly tooltipText!: string;
  @Prop({ default: 12, type: Number }) readonly symbols!: number;
  @Prop({ default: 0, type: Number }) readonly offset!: number;

  get count(): number {
    return this.symbols / 2;
  }

  get firstPartWidth(): string {
    const text = this.value.slice(0, this.count);
    const width = getTextWidth(text) - this.offset;
    return width + 'px';
  }

  get secondPart(): string {
    // TODO: Remove this dirty hack. It's made just for browser search
    return this.value.slice(-this.count);
  }
}
</script>

<style lang="scss" scoped>
.formatted-address {
  @include hint-text;

  display: inline-flex;
  cursor: pointer;
  letter-spacing: normal;

  &:hover {
    text-decoration: underline;
  }

  .first {
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
