<template>
  <dialog-base :visible.sync="isVisible">
    <simple-notification
      optional
      modal-content
      v-model="hideDeleteDialog"
      :button-text="t('logoutText')"
      :loading="loading"
      @submit.native.prevent="handleConfirm"
    >
      <template #title>{{ t('desktop.assetsAtRiskText') }}</template>
      <template #text>{{ t('desktop.deleteAccountText') }}</template>
    </simple-notification>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import SimpleNotification from '../SimpleNotification.vue';

@Component({
  components: {
    DialogBase,
    SimpleNotification,
  },
})
export default class AccountDeleteDialog extends Mixins(TranslationMixin, DialogMixin) {
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;

  @Watch('isVisible')
  private setupFormState(visibility: boolean): void {
    if (!visibility) {
      this.hideDeleteDialog = false;
    }
  }

  hideDeleteDialog = false;

  async handleConfirm(): Promise<void> {
    this.$emit('confirm', !this.hideDeleteDialog);
  }
}
</script>
