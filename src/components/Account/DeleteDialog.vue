<template>
  <dialog-base :visible.sync="isVisible">
    <simple-notification class="account-delete-dialog" @close="closeDialog">
      <template #title>{{ t('desktop.assetsAtRiskText') }}</template>
      <template #text>{{ t('desktop.deleteAccountText') }}</template>
      <template>
        <s-divider class="account-delete-dialog__divider" />
        <div class="account-delete-dialog__switch">
          <s-switch v-model="hideDeleteDialog" />
          <span>{{ t('doNotShowText') }}</span>
        </div>
        <s-button
          type="primary"
          class="account-delete-dialog__button simple-notification__button s-typography-button--big"
          @click="handleConfirm"
        >
          {{ t('logoutText') }}
        </s-button>
      </template>
    </simple-notification>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';

import DialogBase from '../DialogBase.vue';
import SimpleNotification from '../SimpleNotification.vue';

import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

@Component({
  components: {
    DialogBase,
    SimpleNotification,
  },
})
export default class AccountDeleteDialog extends Mixins(TranslationMixin, DialogMixin) {
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

<style lang="scss" scoped>
.account-delete-dialog {
  &__divider {
    margin: 0;
  }

  &__switch {
    @include switch-block;
    padding: 0;
  }

  &__button.el-button.neumorphic.s-primary {
    background-color: red;
    color: white;
  }
}
</style>
