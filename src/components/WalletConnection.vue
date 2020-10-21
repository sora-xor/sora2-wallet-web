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
@import '../styles/typography';
@import '../styles/variables';
@import '../styles/colors';

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
    margin-top: 16px;
    width: 100%;
  }
}
</style>
