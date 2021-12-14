<template>
  <div class="info-line">
    <slot name="info-line-prefix" />
    <span class="info-line-label">{{ label }}</span>
    <s-tooltip
      v-if="labelTooltip"
      popper-class="info-tooltip info-tooltip--info-line"
      :content="labelTooltip"
      placement="right-start"
      border-radius="mini"
    >
      <s-icon name="info-16" size="14px" />
    </s-tooltip>
    <div class="info-line-content">
      <template v-if="isValueExists">
        <slot name="info-line-value-prefix" />
        <formatted-amount
          v-if="isFormatted"
          class="info-line-value"
          :value="value"
          :asset-symbol="assetSymbol"
          :font-size-rate="formattedFontSize"
          :font-weight-rate="formattedFontWeight"
          :value-can-be-hidden="valueCanBeHidden"
        />
        <span v-else-if="!valueCanBeHidden || !shouldBalanceBeHidden" class="info-line-value">
          {{ value }}
          <span v-if="assetSymbol" class="asset-symbol">{{ ' ' + assetSymbol }}</span>
        </span>
        <span v-else class="info-line-value">{{ HiddenValue }}</span>
        <formatted-amount
          v-if="fiatValue"
          is-fiat-value
          with-left-shift
          :value="fiatValue"
          :font-size-rate="formattedFontSize"
          :value-can-be-hidden="valueCanBeHidden"
        />
      </template>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import FormattedAmount from './FormattedAmount.vue';
import { FontSizeRate, FontWeightRate, HiddenValue } from '../consts';

@Component({
  components: { FormattedAmount },
})
export default class InfoLine extends Vue {
  readonly HiddenValue = HiddenValue;

  @Prop({ default: '', type: String }) readonly label!: string;
  @Prop({ default: '', type: String }) readonly labelTooltip!: string;
  @Prop({ default: '' }) readonly value!: string;
  @Prop({ default: '', type: String }) readonly assetSymbol!: string;
  @Prop({ default: false, type: Boolean }) readonly isFormatted!: boolean;
  @Prop({ default: '', type: String }) readonly fiatValue!: string;
  /**
   * Define directly that this field displays value which can be hidden by hide balances button.
   */
  @Prop({ default: false, type: Boolean }) readonly valueCanBeHidden!: boolean;

  @Getter shouldBalanceBeHidden!: boolean;

  get isValueExists(): boolean {
    if (this.value === 'NaN' || this.value.includes('Infinity')) {
      console.warn(`The ${this.label} value is: ${this.value}.`);
      return false;
    }
    return !!this.value;
  }

  get formattedFontSize(): Nullable<FontSizeRate> {
    return this.isFormatted ? FontSizeRate.MEDIUM : null;
  }

  get formattedFontWeight(): Nullable<FontWeightRate> {
    return this.isFormatted ? FontWeightRate.SMALL : null;
  }
}
</script>

<style lang="scss">
.info-tooltip--info-line {
  margin-top: -10px;
  .popper__arrow {
    margin-top: #{$basic-spacing-mini};
  }
}
.info-line {
  &-container {
    border-radius: var(--s-border-radius-small);
    margin-top: var(--s-basic-spacing);
    padding: var(--s-basic-spacing) 0 0;
    width: 100%;

    &__title {
      font-size: var(--s-heading6-font-size);
      font-weight: 300;
      line-height: var(--s-line-height-medium);
      letter-spacing: var(--s-letter-spacing-small);
      color: var(--s-color-base-content-secondary);
      text-transform: uppercase;
      margin-bottom: #{$basic-spacing-small};
    }
  }
}
</style>

<style lang="scss" scoped>
.info-line {
  display: flex;
  align-items: center;
  width: 100%;
  padding: #{$basic-spacing-extra-mini} #{$basic-spacing-mini};
  color: var(--s-color-base-content-primary);
  font-size: var(--s-font-size-extra-small);
  line-height: var(--s-line-height-small);
  border-bottom: 1px solid var(--s-color-base-border-secondary);
  & + .info-line {
    margin-top: #{$basic-spacing-small};
  }
  &:first-child {
    margin-top: 0;
  }
  &-container {
    width: 100%;
  }
  &-label {
    margin-right: var(--s-basic-spacing);
    word-break: keep-all;
    text-transform: uppercase;
  }
  &-content {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    flex-wrap: wrap;
    flex-grow: 1;
    word-break: break-all;
    text-align: right;
  }
  &-value {
    margin-left: auto;
    text-align: right;
    font-weight: 600;
    &-prefix {
      margin-left: auto;
      + .info-line-value {
        margin-left: 0;
      }
    }
  }
  .asset-symbol {
    word-break: keep-all;
    white-space: nowrap;
  }
  .el-tooltip {
    margin-top: -1px;
    margin-right: var(--s-basic-spacing);
    flex-shrink: 0;
    i {
      margin-top: auto;
      margin-bottom: auto;
      display: block;
      color: var(--s-color-base-content-tertiary);
    }
  }
  &-icon {
    position: relative;
    height: var(--s-size-mini);
    width: var(--s-size-mini);
    border-radius: var(--s-border-radius-small);
    color: inherit;
    &:hover {
      background-color: var(--s-color-base-background-hover);
      cursor: pointer;
    }
    &:before {
      position: absolute;
      display: block;
      height: var(--s-icon-font-size-mini);
      width: var(--s-icon-font-size-mini);
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      font-size: var(--s-icon-font-size-mini);
    }
    &--left {
      order: -1;
    }
  }
  .el-button {
    margin-left: var(--s-basic-spacing);
    margin-right: 0;
  }
  .token-logo {
    margin-right: var(--s-basic-spacing);
  }
  p {
    font-size: inherit;
  }
  .formatted-amount--fiat-value {
    line-height: inherit;
  }
}
</style>
