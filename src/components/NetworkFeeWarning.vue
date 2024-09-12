<template>
  <simple-notification
    optional
    modal-content
    v-model="hidePopup"
    :button-text="t('confirmNextTxFailure.button')"
    @submit.native.prevent="handleConfirm"
  >
    <template #title>{{ t('confirmNextTxFailure.header') }}</template>
    <template #text>
      <div>{{ t('confirmNextTxFailure.info', { fee, symbol }) }}</div>
      <div v-if="payoff">{{ t('confirmNextTxFailure.payoff') }}</div>
    </template>
  </simple-notification>
</template>

<script lang="ts">
import { KnownSymbols } from '@sora-substrate/sdk/build/assets/consts';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { mutation } from '../store/decorators';

import TranslationMixin from './mixins/TranslationMixin';
import SimpleNotification from './SimpleNotification.vue';

@Component({
  components: {
    SimpleNotification,
  },
})
export default class NetworkFeeWarning extends Mixins(TranslationMixin) {
  @Prop({ type: String }) readonly fee!: string;
  @Prop({ type: String, default: KnownSymbols.XOR }) readonly symbol!: string;
  @Prop({ type: Boolean, default: true }) readonly payoff!: boolean;

  @mutation.settings.setAllowFeePopup private setAllowFeePopup!: (flag: boolean) => void;

  hidePopup = false;

  async handleConfirm(): Promise<void> {
    this.setAllowFeePopup(!this.hidePopup);
    this.$emit('confirm');
  }
}
</script>
