<template>
  <s-tooltip :content="copyTooltip(tooltipText)" tabindex="-1" append-to-body>
    <div class="formatted-address" @click="handleCopyAddress(value, $event)">
      <template v-if="sliced">
        <span class="address" :style="{ width: firstPartWidth }">{{ value }}</span>
        ...
        <span>{{ secondPart }}</span>
      </template>
      <template v-else>
        {{ value }}
      </template>
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
  /** Default visible address length, default: 12 */
  @Prop({ default: 12, type: [Number, String] }) readonly symbols!: number | string;
  /** Offset in px, default: 0 */
  @Prop({ default: 0, type: [Number, String] }) readonly offset!: number | string;
  /** Offset in symbols, default: 0 */
  @Prop({ default: 0, type: [Number, String] }) readonly symbolsOffset!: number | string;

  get sliced(): boolean {
    return this.value.length >= +this.symbols;
  }

  get count(): number {
    return +this.symbols / 2;
  }

  get firstPartWidth(): string {
    const text = this.value.slice(0, Math.round(this.count) + Number(this.symbolsOffset));
    const width = getTextWidth(text) - Number(this.offset);
    return width + 'px';
  }

  get secondPart(): string {
    // TODO: Remove this dirty hack. It's made just for browser search
    return this.value.slice(-Math.floor(this.count) + Number(this.symbolsOffset));
  }
}
</script>

<style lang="scss" scoped>
.formatted-address {
  @include hint-text;

  display: inline-flex;
  color: inherit;
  cursor: pointer;
  letter-spacing: normal;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }

  .address {
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
