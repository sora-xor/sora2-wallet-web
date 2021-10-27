<template>
  <wallet-base :title="t('mst.create.title')" show-back @back="handleBack">
    <p class="create-mst_desc">Screen in development...</p>
    <div class="create-mst">
      <!-- v-model="msaName" -->
      <s-input :placeholder="t('mst.create.name.placeholder')" disabled />
      <p class="create-mst_desc">{{ t('mst.create.name.desc') }}</p>
      <!-- v-model="msaAddresses" -->
      <s-input :placeholder="t('mst.create.addresses.placeholder')" disabled />
      <p class="create-mst_desc">{{ t('mst.create.addresses.desc') }}</p>
      <!-- TODO 4 alexnatalia: max = msaAddresses.length -->
      <!-- v-model="msaThreshold" -->
      <s-float-input
        :placeholder="t('mst.create.threshold.placeholder')"
        :decimals="decimals"
        has-locale-string
        :delimiters="delimiters"
        disabled
      />
      <p class="create-mst_desc">{{ t('mst.create.threshold.desc') }}</p>
      <s-button class="create-mst_action s-typography-button--large" type="primary" :loading="loading" disabled>
        <template>{{ t('mst.create.action') }}</template>
      </s-button>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action } from 'vuex-class';

import WalletBase from './WalletBase.vue';
import InfoLine from './InfoLine.vue';
import TransactionMixin from './mixins/TransactionMixin';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';
import { RouteNames } from '../consts';

@Component({
  components: {
    WalletBase,
    InfoLine,
  },
})
export default class CreateMultisigAccount extends Mixins(TransactionMixin, NumberFormatterMixin) {
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  handleBack(): void {
    this.navigate({ name: RouteNames.MultisigAccount });
  }
}
</script>

<style scoped lang="scss">
.create-mst {
  &_desc {
    color: var(--s-color-base-content-primary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    padding: var(--s-basic-spacing) #{$basic-spacing-small} #{$basic-spacing-medium};
  }
  &_action {
    margin-top: #{$basic-spacing-medium};
    width: 100%;
  }
}
</style>
