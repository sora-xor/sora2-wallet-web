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
        >
          {{ t('connection.import.action') }}
        </s-button>
      </s-card>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue } from 'vue-property-decorator'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { lazyComponent } from '@/util'

@Component({
  components: { WalletBase }
})
export default class WalletConnection extends Mixins(TranslationMixin) {
}
</script>

<style scoped lang="scss">
$font-size-title: 18px;
$font-size-hint: 12px;
$s-color-content-tertiary: #75787B; // TODO: use it from updated library

.wallet-connection {
  &-create {
    margin-bottom: 20px;
  }
  .title {
    text-align: center;
    font-size: $font-size-title;
    line-height: 180%;
  }
  .hint {
    text-align: center;
    font-size: $font-size-hint;
    color: $s-color-content-tertiary;
    line-height: 180%;
  }
  .action {
    margin-top: 16px;
    width: 100%;
  }
}
</style>
