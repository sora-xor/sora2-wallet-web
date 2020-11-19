<template>
  <s-card class="base">
    <template #header>
      <div class="base-title s-flex">
        <s-button
          v-if="showBack"
          class="base-title_back"
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
          @click="handleCloseClick"
        />
      </div>
    </template>
    <slot />
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { RouteNames } from '../consts'

@Component
export default class WalletBase extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly title!: string
  @Prop({ default: false, type: Boolean }) readonly showClose!: boolean
  @Prop({ default: false, type: Boolean }) readonly showSettings!: boolean
  @Prop({ default: false, type: Boolean }) readonly showBack!: boolean

  @Action navigate

  handleBackClick (): void {
    this.$emit('back')
  }

  handleSettingsClick (): void {
    this.navigate({ name: RouteNames.WalletSettings })
    this.$emit('settings')
  }

  handleCloseClick (): void {
    this.$emit('close')
  }
}
</script>

<style scoped lang="scss">
$font-size-title: $font-size_medium;

.base {
  width: $wallet-width;
  font-size: $font-size_basic;
  line-height: $line-height_basic;
  &-title {
    align-items: center;
    > span {
      flex: 1;
      font-size: $font-size-title;
    }
    &_back {
      margin-right: $basic-spacing;
    }
  }
}
</style>
