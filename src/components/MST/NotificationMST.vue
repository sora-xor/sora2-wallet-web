<template>
  <div v-if="visible" class="notification-mst">
    <s-button class="close-button" @click="closeNotification"> <s-icon name="x-16" size="14" /> </s-button>

    <p>A sign is needed to confirm the transaction. Please switch to a multisig account.</p>
    <s-button type="secondary" @click="handleButtonClick">See Multisig activity</s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../../api';
import { RouteNames } from '../../consts';
import { mutation, state, action } from '../../store/decorators';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import NotificationMixin from '../mixins/NotificationMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import SimpleNotification from '../SimpleNotification.vue';

import type { Route } from '../../store/router/types';

@Component({
  components: {
    DialogBase,
    SimpleNotification,
    FormattedAddress,
  },
})
export default class NotificationMST extends Mixins(TranslationMixin, NotificationMixin, DialogMixin) {
  declare visible: boolean;
  @mutation.router.navigate private navigate!: (options: Route) => void;
  @mutation.account.setIsMstAddressExist setIsMstAddressExist!: (isExist: boolean) => void;
  @mutation.account.setIsMST setIsMST!: (isMST: boolean) => void;
  @mutation.account.syncWithStorage syncWithStorage!: () => void;
  @state.account.isMST isMST!: boolean;

  @action.account.afterLogin afterLogin!: () => void;

  closeNotification() {
    this.$emit('update:visible', false);
  }

  handleButtonClick() {
    console.info('clicked');
    if (!this.isMST) {
      console.info('we will now switch to mst');
      api.mst.switchAccount(true);
      this.setIsMST(true);
      this.syncWithStorage();
      this.afterLogin();
    }
    this.navigate({ name: RouteNames.Wallet });
    this.$emit('update:visible', false);
  }
}
</script>

<style lang="scss" scoped>
.notification-mst {
  position: fixed;
  top: 72px;
  right: 16px;
  width: 370px;
  height: 116px;
  z-index: 1000;
  background-color: #a09a9d;
  border-radius: 12px;
  padding: 14px;
  p {
    color: #ffffff;
    max-width: 320px;
    font-size: 13px;
  }
  button {
    margin-top: 12px;
    font-size: 12px;
    box-shadow: unset !important;
    padding: 8px !important;
    &:hover {
      background: var(--s-color-base-content-tertiary) !important;
    }
  }
  .close-button {
    position: absolute;
    top: -8px;
    right: 8px;
    background: unset !important;
    border: none;
    cursor: pointer;
    &:hover {
      background: #a09a9d !important;
    }
  }
}
</style>
