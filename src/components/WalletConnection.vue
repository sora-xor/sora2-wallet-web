<template>
  <wallet-base :title="t('connection.title')" show-close @close="handleClose">
    <div class="wallet-connection">
      <s-card class="wallet-connection-create" border-radius="medium" shadow="never">
        <div class="title">{{ t('connection.create.title') }}</div>
        <div class="hint">{{ t('connection.create.hint') }}</div>
        <s-button
          class="action"
          type="primary"
          size="medium"
          @click="handleNavigate(RouteNames.WalletCreation)"
        >
          {{ t('connection.create.action') }}
        </s-button>
      </s-card>
      <s-card class="wallet-connection-import" border-radius="medium" shadow="never">
        <div class="title">{{ t('connection.import.title') }}</div>
        <div class="hint">{{ t('connection.import.hint') }}</div>
        <s-button
          class="action"
          type="primary"
          size="medium"
          @click="handleNavigate(RouteNames.WalletImport)"
        >
          {{ t('connection.import.action') }}
        </s-button>
      </s-card>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'

@Component({
  components: { WalletBase }
})
export default class WalletConnection extends Mixins(TranslationMixin) {
  readonly RouteNames = RouteNames

  @Action navigate

  handleNavigate (name: RouteNames): void {
    this.navigate({ name })
  }

  handleClose (): void {
    this.$emit('close')
  }
}
</script>

<style scoped lang="scss">
.wallet-connection {
  &-create {
    margin-bottom: $basic-spacing;
  }
  .title,
  .hint {
    text-align: center;
    line-height: $line-height_medium;
  }
  .title {
    font-size: $font-size_normal;
  }
  .hint {
    @include hint-text;
  }
  .action {
    margin-top: $basic-spacing;
    width: 100%;
  }
}

.s-card {
  &:hover,
  &:focus {
    border-color: var(--s-color-base-border-primary);
  }
}
</style>
