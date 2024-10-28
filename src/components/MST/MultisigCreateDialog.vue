<template>
  <dialog-base title="Multisig address creation" :visible.sync="isVisible" append-to-body>
    <div class="data-multisig">
      <div class="data">
        <p>Name</p>
        <p>{{ mstData.multisigName }}</p>
      </div>
      <s-divider />
      <div class="data">
        <p>Threshold</p>
        <p>{{ threshold }}/{{ mstData.addresses.length }}</p>
      </div>
      <s-divider />
      <s-scrollbar class="data-multisig__scrollbar">
        <div class="data-multisig-scrollbar__info">
          <div class="address" v-for="(address, index) in mstData.addresses" :key="index + 1">
            <div class="data">
              <p>Address {{ index + 1 }}</p>
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
      <s-button type="primary" @click="handleCreateClose"> Continue </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../../api';
import { RouteNames } from '../../consts';
import { createMSTWallet } from '../../services/mst';
import { mutation } from '../../store/decorators';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import NotificationMixin from '../mixins/NotificationMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import SimpleNotification from '../SimpleNotification.vue';

import type { Route } from '../../store/router/types';
import type { MSTData } from '../../types/mst';

@Component({
  components: {
    DialogBase,
    SimpleNotification,
    FormattedAddress,
  },
})
export default class MultisigCreateDialog extends Mixins(TranslationMixin, NotificationMixin, DialogMixin) {
  @Prop({ default: () => ({}), type: Object }) readonly mstData!: MSTData;
  @Prop({ default: 0, type: Number }) readonly threshold!: number;

  createMSTWallet = createMSTWallet;

  cardMessages = [
    'For your multisig to function properly, all listed addresses must create the multisig in the exact same way as you did.',
    'Multisig wallet cannot possibly be changed in the future, only the name.',
  ];

  @mutation.router.navigate private navigate!: (options: Route) => void;

  handleCreateClose(): void {
    this.createMSTWallet(this.mstData.addresses, this.mstData.threshold || 0, this.mstData.multisigName);
    this.closeDialog();
    this.navigate({ name: RouteNames.Wallet });
    this.showAppNotification('Multisig wallet has been successfully set up!', 'success');
  }
}

// const transferData = [
//   {
//     assetAddress: '0x0200000000000000000000000000000000000000000000000000000000000000', // Replace with actual asset address
//     toAddress: 'cnT3RCp1vihUWncRgHvFBz1ior5phHknTnNM3GUPpmtGnWHVW', // Replace with recipient address
//     amount: '100', // Replace with actual amount
//   },
//   {
//     assetAddress: '0x0200000000000000000000000000000000000000000000000000000000000000',
//     toAddress: 'cnT3RCp1vihUWncRgHvFBz1ior5phHknTnNM3GUPpmtGnWHVW',
//     amount: '100',
//   },
//   {
//     assetAddress: '0x0200000000000000000000000000000000000000000000000000000000000000',
//     toAddress: 'cnT3RCp1vihUWncRgHvFBz1ior5phHknTnNM3GUPpmtGnWHVW',
//     amount: '100',
//   },
// ];
// const coSigners = [
//   'cnT3RCp1vihUWncRgHvFBz1ior5phHknTnNM3GUPpmtGnWHVW',
//   'cnVP5BrQPuC2vZpXVKw53oy2Vx2mN6cMXYiJbZRAGAcNaefpu',
//   'cnVP5BrQPuC2vZpXVKw53oy2Vx2mN6cMXYiJbZRAGAcNaefpu',
// ]; // Replace with actual co-signers

// // Define threshold (e.g., minimum number of signatures required)
// const threshold = 2; // Replace with actual threshold

// console.info(this.mstData);
// // console.info('we are in prefilteredAssets');
// // console.info(api);
// // console.info(api.mstTransfers);
// console.info('we are going to make transferCall');
// const transferCall = api.mstTransfers.prepareCall(transferData);

// console.info('here is transferCall');
// console.info(transferCall);
// console.info('// Step 2: Prepare the extrinsic for multisig using the batch call');
// // Step 2: Prepare the extrinsic for multisig using the batch call
// const mstExtrinsic = api.mstTransfers.prepareExtrinsic(transferCall, threshold, coSigners);
// console.info('here is mstExtrinsic');
// console.info(mstExtrinsic);
// // Optional: Get network fee
// const fee = api.mstTransfers.getNetworkFee(mstExtrinsic);
// console.log('Estimated Network Fee:', fee);

// // Step 3: Submit the extrinsic (MST)
// const result = api.mstTransfers.submit(mstExtrinsic);
// console.log('Transaction Result:', result);
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
