<template>
  <dialog-base :visible.sync="isVisible">
    <simple-notification class="account-delete-dialog">
      <template #title>Assets at risk!</template>
      <template #text>Account can’t be recovered without a seed phrase, .json file or if it’s stored in some extension. You will be
        logged out.</template>
      <template>
        <s-divider class="account-delete-dialog__divider" />
      </template>
    </simple-notification>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import DialogBase from '../DialogBase.vue';
import SimpleNotification from '../SimpleNotification.vue';

import DialogMixin from '../mixins/DialogMixin';

@Component({
  components: {
    DialogBase,
    SimpleNotification,
  },
})
export default class AccountDeleteDialog extends Mixins(DialogMixin) {}
</script>

<style lang="scss" scoped>
.account-delete-dialog {
  &__divider {
    margin: $basic-spacing-medium 0;
  }
}
</style>
