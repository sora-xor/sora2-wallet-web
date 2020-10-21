<template>
  <s-card class="wallet">
    <template #header>
      <div class="wallet-title s-flex">
        <span>{{ title }}</span>
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
import { Component, Mixins, Prop, Vue } from 'vue-property-decorator'

import TranslationMixin from './mixins/TranslationMixin'

@Component
export default class WalletBase extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly title!: string
  @Prop({ default: false, type: Boolean }) readonly showClose!: boolean
}
</script>

<style scoped lang="scss">
$font-size-title: 24px;

.wallet {
  width: 448px;
  &-title {
    align-items: center;
    > span {
      flex: 1;
      font-size: $font-size-title;
    }
  }
}
</style>
