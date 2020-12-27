<template>
  <s-card class="base" border-radius="medium" shadow="never">
    <template #header>
      <div :class="headerClasses">
        <s-tooltip
          class="header-tooltip"
          popper-class="info-tooltip info-tooltip--header"
          :content="t('backText')"
          border-radius="mini"
          placement="bottom-start"
          animation="none"
          :show-arrow="false"
        >
          <s-button
            v-if="showBack"
            class="base-title_back"
            type="action"
            icon="chevron-left-rounded"
            size="medium"
            @click="handleBackClick"
          />
        </s-tooltip>
        <span>{{ title }}</span>
        <s-tooltip
          class="header-tooltip"
          popper-class="info-tooltip info-tooltip--header"
          :content="t('settingsText')"
          border-radius="mini"
          placement="bottom-end"
          animation="none"
          :show-arrow="false"
        >
          <s-button
            v-if="showSettings"
            class="base-title_settings"
            type="action"
            icon="settings"
            size="medium"
            @click="handleSettingsClick"
          />
        </s-tooltip>
        <s-tooltip
          class="header-tooltip"
          popper-class="info-tooltip info-tooltip--header"
          :content="t('closeText')"
          border-radius="mini"
          placement="bottom-end"
          animation="none"
          :show-arrow="false"
        >
          <s-button
            v-if="showClose"
            class="base-title_close"
            type="action"
            icon="x-rounded"
            size="medium"
            @click="handleCloseClick"
          />
        </s-tooltip>
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

  get headerClasses (): Array<string> {
    const cssClasses: Array<string> = ['base-title', 's-flex']
    if (this.showBack) {
      cssClasses.push('base-title--center')
    }
    return cssClasses
  }

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

<style lang="scss">
.info-tooltip--header {
  margin-top: #{$basic-spacing_mini / 2} !important;
}
</style>

<style scoped lang="scss">
$button-size: var(--s-size-medium);

.base {
  @include s-card-styles;
  width: $wallet-width;
  font-size: $font-size_basic;
  line-height: $line-height_basic;
  &-title {
    position: relative;
    height: $button-size;
    align-items: center;
    padding-right: $button-size + $basic-spacing;
    &--center {
      padding-left: $button-size + $basic-spacing;
      text-align: center;
    }
    > span {
      flex: 1;
      font-size: $font-size_medium;
      line-height: $button-size;
    }
    .el-button {
      position: absolute;
      top: 0;
    }
    &_back {
      left: 0;
    }
    &_settings,
    &_close {
      right: 0;
    }
  }
}
</style>
