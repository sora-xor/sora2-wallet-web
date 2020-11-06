<template>
  <s-card class="wallet">
    <template #header>
      <div class="wallet-title s-flex">
        <s-button
          v-if="showBack"
          class="wallet-title-back"
          type="action"
          icon="back"
          size="medium"
          :tooltip="t('backText')"
          @click="handleBackClick"
        />
        <span>{{ title }}</span>
        <s-button
          v-if="showSettings"
          type="action"
          icon="settings"
          size="medium"
          :tooltip="t('settingsText')"
          @click="handleSettingsClick"
        />
        <s-button
          v-if="showClose"
          type="action"
          icon="x-rounded"
          size="medium"
          :tooltip="t('closeText')"
        />
      </div>
    </template>
    <slot />
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'

import TranslationMixin from './mixins/TranslationMixin'

@Component
export default class WalletBase extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly title!: string
  @Prop({ default: false, type: Boolean }) readonly showClose!: boolean
  @Prop({ default: false, type: Boolean }) readonly showSettings!: boolean
  @Prop({ default: false, type: Boolean }) readonly showBack!: boolean

  handleBackClick (): void {
    this.$emit('back')
  }

  handleSettingsClick (): void {
    this.$emit('settings')
  }
}
</script>

<style scoped lang="scss">
@import '../styles/typography';
@import '../styles/variables';
@import '../styles/layout';

$font-size-title: $font-size_medium;

.wallet {
  width: $wallet-width;
  font-size: $font-size_basic;
  line-height: $line-height_basic;
  &-title {
    align-items: center;
    > span {
      flex: 1;
      font-size: $font-size-title;
    }
    &-back {
      margin-right: $basic-spacing;
    }
  }
}
</style>
