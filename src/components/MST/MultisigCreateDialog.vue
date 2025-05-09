<template>
  <dialog-base
    :title="t('mst.addrCreation')"
    :visible.sync="isVisible"
    append-to-body
    show-back
    @back="handleBack"
    @close="handleClose"
  >
    <div class="data-multisig">
      <div class="data">
        <p>{{ t('nameText') }}</p>
        <p>{{ mstData.multisigName }}</p>
      </div>
      <s-divider />
      <div class="data">
        <p>{{ t('mst.threshold') }}</p>
        <p>{{ threshold }}/{{ mstData.addresses.length }}</p>
      </div>
      <s-divider />
      <s-scrollbar class="data-multisig__scrollbar">
        <div class="data-multisig-scrollbar__info">
          <div class="address" v-for="(address, index) in mstData.addresses" :key="index + 1">
            <div class="data">
              <p>{{ t('addressText') }} {{ index + 1 }}</p>
              <formatted-address :value="address" :symbols="24" />
            </div>
            <s-divider v-if="index < mstData.addresses.length - 1" />
          </div>
        </div>
      </s-scrollbar>

      <div class="multisig-cards">
        <s-card v-for="(message, index) in cardMessages" :key="index" class="data-card">
          <div class="data">
            <p>{{ message }}</p>
            <s-icon class="notification-icon" name="notifications-alert-triangle-24" size="22px" />
          </div>
        </s-card>
      </div>
      <s-button type="primary" @click="handleCreateClose">{{ t('mst.continue') }}</s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../../api';
import { RouteNames } from '../../consts';
import { mutation, action } from '../../store/decorators';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import NotificationMixin from '../mixins/NotificationMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import SimpleNotification from '../SimpleNotification.vue';

import CreateMstWalletDialog from './CreateMstWalletDialog.vue';

import type { Route } from '../../store/router/types';
import type { MSTData } from '../../types/mst';

@Component({
  name: 'MultisigCreateDialog',
  components: {
    DialogBase,
    SimpleNotification,
    FormattedAddress,
    CreateMstWalletDialog,
  },
})
export default class MultisigCreateDialog extends Mixins(TranslationMixin, NotificationMixin, DialogMixin) {
  @Prop({ default: () => ({}), type: Object }) readonly mstData!: MSTData;
  @Prop({ default: 0, type: Number }) readonly threshold!: number;

  cardMessages = [this.t('mst.cardMessageFirst'), this.t('mst.cardMessageSecond')];

  @mutation.router.navigate private navigate!: (options: Route) => void;
  @mutation.account.setIsMstAddressExist setIsMstAddressExist!: (isExist: boolean) => void;
  @mutation.account.setIsMST setIsMST!: (isMST: boolean) => void;
  @mutation.account.syncWithStorage syncWithStorage!: () => void;

  @action.account.afterLogin afterLogin!: () => void;
  @action.transactions.trackPendingMstTxs trackPendingMstTxs!: () => void;

  shouldShowCreateMSTWalletDialog = false;

  handleClose() {
    this.closeDialog();
    this.$emit('close');
  }

  handleBack() {
    this.closeDialog();
    this.$emit('back');
  }

  handleCreateClose(): void {
    api.mst.createMST(
      this.mstData.addresses,
      this.mstData.threshold || 0,
      this.mstData.multisigName,
      this.mstData.duration
    );
    this.setIsMstAddressExist(true);
    this.setIsMST(true);
    api.mst.switchAccount(true);
    this.syncWithStorage();
    this.afterLogin();
    this.trackPendingMstTxs();
    this.closeDialog();
    this.navigate({ name: RouteNames.Wallet });
    this.showAppNotification(this.t('mst.successMstSetUp'), 'success');
  }
}
</script>

<style lang="scss">
.data-multisig__scrollbar {
  @include scrollbar($basic-spacing-big);
  height: 105px;
  .el-scrollbar__wrap {
    overflow-x: unset;
  }
}
</style>

<style lang="scss" scoped>
.data-multisig {
  display: flex;
  flex-direction: column;
  .el-divider--horizontal {
    margin-top: $basic-spacing-extra-mini;
    margin-bottom: $basic-spacing-small;
  }
  .data {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
  &__info,
  .address,
  .multisig-cards {
    display: flex;
    flex-direction: column;
  }
  .multisig-cards {
    margin-top: $inner-spacing-mini;
    gap: calc($basic-spacing-mini * 2.5);
    margin-bottom: $basic-spacing-big;
  }
  .data-card {
    background: var(--s-color-utility-body);
    box-shadow: var(--s-shadow-element-pressed);
    p {
      max-width: calc($asset-item-height * 4.5);
    }
  }
  .notification-icon {
    padding: $basic-spacing;
    border-radius: 50%;
    background-color: var(--s-color-status-info);
    box-shadow: var(--s-shadow-element-pressed);
    color: #ffffff;
  }
}
</style>
