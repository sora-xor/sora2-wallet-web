<template>
  <wallet-base :title="t('connection.title')" show-close>
    <div class="wallet-connection">
      <s-card class="wallet-connection-create">
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
      <s-card class="wallet-connection-import">
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
}
</script>

<style scoped lang="scss">
@import '../styles/typography';
@import '../styles/variables';
@import '../styles/colors';
@import '../styles/layout';

$font-size-title: $font-size_normal;
$font-size-hint: $font-size_small;

.wallet-connection {
  &-create {
    margin-bottom: 20px;
  }
  .title {
    text-align: center;
    font-size: $font-size-title;
    line-height: 1.8;
  }
  .hint {
    text-align: center;
    font-size: $font-size-hint;
    color: $s-color-content-tertiary;
    line-height: 1.8;
  }
  .action {
    margin-top: $basic-spacing;
    width: 100%;
  }
}
</style>
