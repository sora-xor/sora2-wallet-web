<template>
  <dialog-base title="Forget Multisig account" :visible.sync="isVisible" append-to-body>
    <div class="forget-multisig">
      <s-card class="warning-delete-card">
        <div class="notification">
          <p>Your login details will be deleted. You will permanently lose access to your account.</p>
          <s-icon class="notification-icon" name="notifications-alert-triangle-24" size="22px" />
        </div>
      </s-card>
      <p>Are you sure you want to forget Multisig account?</p>
      <s-button type="primary" @click="forgetMST">forget</s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../../api';
import { mutation, state, action } from '../../store/decorators';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import NotificationMixin from '../mixins/NotificationMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import SimpleNotification from '../SimpleNotification.vue';

@Component({
  components: {
    DialogBase,
    SimpleNotification,
    FormattedAddress,
  },
})
export default class MstForgetDialog extends Mixins(TranslationMixin, NotificationMixin, DialogMixin) {
  @mutation.account.setIsMstAddressExist setIsMstAddressExist!: (isExist: boolean) => void;
  @mutation.account.setIsMST setIsMST!: (isMST: boolean) => void;
  @mutation.account.syncWithStorage syncWithStorage!: () => void;

  @action.account.afterLogin afterLogin!: () => void;

  @state.account.isMST isMST!: boolean;

  public forgetMST() {
    if (!this.isMST) {
      // Switch account to MST
      api.mstTransfers.switchAccount(true);
    }
    api.mstTransfers.forgetMSTAccount();
    this.setIsMstAddressExist(false);
    this.setIsMST(false);
    this.syncWithStorage();
    this.afterLogin();
    this.closeDialog();
  }
}
</script>

<style lang="scss" scoped>
.forget-multisig {
  display: flex;
  flex-direction: column;
  .warning-delete-card {
    background-color: var(--s-color-utility-body);
    margin-bottom: 12px;
    .notification {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      p {
        max-width: 316px;
      }
      &-icon {
        padding: $basic-spacing;
        border-radius: 50%;
        background-color: var(--s-color-status-info);
        box-shadow: var(--s-shadow-element-pressed);
        color: #ffffff;
      }
    }
  }

  .el-button {
    margin-top: 24px;
  }
}
</style>
