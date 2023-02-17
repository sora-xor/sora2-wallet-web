<template>
  <dialog-base :visible.sync="isVisible">
    <simple-notification class="account-delete-dialog" @close="closeDialog">
      <template #title>Assets at risk!</template>
      <template #text>Account can’t be recovered without a seed phrase, .json file or if it’s stored in some extension. You will be
        logged out.</template>
      <template>
        <s-divider class="account-delete-dialog__divider" />
        <div class="account-delete-dialog__switch">
          <s-switch v-model="hideDeleteDialog" />
          <span>Don’t show me this again</span>
        </div>
        <s-button
          type="primary"
          class="account-delete-dialog__button simple-notification__button s-typography-button--big"
          @click="handleConfirm"
        >
          Yes, Log Out
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

@Component({
  components: {
    DialogBase,
    SimpleNotification,
  },
})
export default class AccountDeleteDialog extends Mixins(DialogMixin) {
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
