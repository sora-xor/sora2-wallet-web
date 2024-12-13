<template>
  <dialog-base
    show-back
    :title="t('mst.multisigAccount')"
    :show-header="showHeader"
    @back="handleBack"
    @close="handleClose"
    :visible.sync="isVisible"
    append-to-body
  >
    <div class="multisig-wallet">
      <s-input :placeholder="t('mst.enterName')" :minlength="1" v-model="multisigName" />
      <p class="multisig-title-data address">{{ t('mst.addMST').toUpperCase() }}</p>
      <account-card class="multisig-user-address">
        <div class="address-card">
          <p>{{ t('mst.addMST') }}</p>
          <formatted-address :value="accountAddress" :symbols="24" :offset="10" />
        </div>
      </account-card>
      <s-scrollbar class="multisig-scrollbar">
        <div class="multisig-addresses-input">
          <div v-for="(address, index) in multisigAddresses" :key="index + 1">
            <address-book-input
              exclude-connected
              v-model="multisigAddresses[index]"
              :is-valid="validAddress(address)"
              :prop-placeholder="t('mst.enterAddress')"
              :on-remove="() => removeAddress(index)"
              :can-remove="multisigAddresses.length > 1"
            />

            <p v-if="isDuplicateAddress(index)" class="error-message">{{ t('mst.addressEntered') }}</p>
            <p v-if="!validAddress(multisigAddresses[index]) && multisigAddresses[index] != ''" class="error-message">
              {{ t('mst.incorrectFormatAddress') }}
            </p>
          </div>
        </div>
      </s-scrollbar>
      <div class="add-multisig-address">
        <s-button type="secondary" :tooltip="t('mst.addAddr')" @click="addAddress">
          <s-icon name="plus-16" size="14" />
        </s-button>
        <p>{{ t('mst.addAddress') }}</p>
      </div>
      <p class="multisig-title-data">{{ t('mst.thresholdNumber').toUpperCase() }}</p>
      <s-input placeholder="1" type="number" v-model="amountOfThreshold" class="threshold-amount">
        <template v-slot:suffix> /{{ totalNumberOfAddresses }} </template>
      </s-input>
      <s-tabs v-model="mstDurationTrxModel" type="rounded" class="multisig-duration-trx">
        <s-tab v-for="duration in durations" :key="duration" :label="duration" :name="duration" />
      </s-tabs>
      <s-button :type="isButtonEnabled() ? 'primary' : 'tertiary'" :disabled="!isButtonEnabled()" @click="handleClick">
        {{ t('mst.setupDetails').toUpperCase() }}
      </s-button>
    </div>
    <multisig-create-dialog
      :visible.sync="MSTDialogVisibility"
      :mst-data="MSTData"
      :threshold="amountOfThreshold"
      @back="handleBackFromMSTDialog"
      @close="handleClose"
    />
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';

import { PolkadotJsAccount } from '@/types/common';

import { mstTrxDeadline } from '../../consts/mst';
import { getter } from '../../store/decorators';
import { validateAddress } from '../../util';
import AccountCard from '../Account/AccountCard.vue';
import AddressBookInput from '../AddressBook/Input.vue';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import WalletBase from '../WalletBase.vue';

import MultisigCreateDialog from './MultisigCreateDialog.vue';

import type { MSTData } from '../../types/mst';

@Component({
  name: 'CreateMstWalletDialog',
  components: {
    DialogBase,
    WalletBase,
    AddressBookInput,
    MultisigCreateDialog,
    AccountCard,
    FormattedAddress,
  },
})
export default class CreateMstWalletDialog extends Mixins(TranslationMixin, DialogMixin) {
  readonly durations = Object.keys(mstTrxDeadline);
  mstDurationTrxModel = '7D';
  showHeader = true;
  multisigName = '';
  multisigAddresses: string[] = [''];
  amountOfThreshold: number | null = null;
  MSTDialogVisibility = false;
  MSTData: MSTData = {
    addresses: [],
    multisigName: '',
    threshold: 0,
    duration: 0,
  };

  @Watch('amountOfThreshold')
  private onAmountOfThresholdUpdate(value: any): void {
    if (value !== null && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        this.amountOfThreshold = null;
        return;
      }
      if (numValue > this.totalNumberOfAddresses) {
        this.amountOfThreshold = this.totalNumberOfAddresses;
      } else if (numValue < 1) {
        this.amountOfThreshold = 1;
      } else {
        this.amountOfThreshold = numValue;
      }
    }
  }

  @getter.account.account private account!: PolkadotJsAccount;

  mounted() {
    this.initializeMultisigAddresses();
  }

  initializeMultisigAddresses(): void {
    this.multisigAddresses = [''];
  }

  isButtonEnabled(): boolean {
    const isMultisigNameFilled = this.multisigName.trim() !== '';
    const areAllAddressesFilled = this.multisigAddresses.every((address) => address.trim() !== '');
    const isThresholdSet = this.amountOfThreshold !== null && this.amountOfThreshold > 0;
    const areAllAddressesValid = this.multisigAddresses.every((address) => this.validAddress(address));
    const noDuplicateAddresses = !this.hasDuplicateAddresses();
    return (
      isMultisigNameFilled && areAllAddressesFilled && isThresholdSet && noDuplicateAddresses && areAllAddressesValid
    );
  }

  get totalNumberOfAddresses(): number {
    return this.multisigAddresses.length + 1;
  }

  get accountAddress(): string {
    return this.account.address;
  }

  public hasDuplicateAddresses(): boolean {
    const addresses = this.multisigAddresses.map((addr) => addr.trim()).filter((addr) => addr !== '');
    const uniqueAddresses = new Set(addresses);
    if (addresses.includes(this.accountAddress.trim())) {
      return true;
    }
    return uniqueAddresses.size !== addresses.length;
  }

  public isDuplicateAddress(index: number): boolean {
    const address = this.multisigAddresses[index].trim();
    if (!address) return false;
    if (address === this.accountAddress.trim()) {
      return true;
    }
    const occurrences = this.multisigAddresses.filter((addr, i) => addr.trim() === address && i !== index).length;
    return occurrences > 0;
  }

  public validAddress(address: string): boolean {
    return validateAddress(address);
  }

  removeAddress(index: number): void {
    if (this.multisigAddresses.length <= 1) {
      return;
    }
    this.multisigAddresses.splice(index, 1);
  }

  handleClose(): void {
    this.$emit('closeMstCreate');
  }

  handleBack(): void {
    this.closeDialog();
  }

  handleBackFromMSTDialog() {
    this.isVisible = true;
    this.MSTDialogVisibility = false;
  }

  handleClick(): void {
    const selectedDuration = mstTrxDeadline[this.mstDurationTrxModel] || 0;

    this.MSTData = {
      addresses: [this.accountAddress, ...this.multisigAddresses],
      multisigName: this.multisigName,
      threshold: this.amountOfThreshold,
      duration: selectedDuration,
    };

    this.closeDialog();
    this.MSTDialogVisibility = true;
  }

  addAddress(): void {
    this.multisigAddresses.push('');
  }
}
</script>

<style lang="scss">
.threshold-amount {
  .s-input__content {
    width: 100%;
    .el-input__suffix {
      margin-right: 90%;
      color: var(--s-color-base-content-tertiary);
    }
    input::placeholder {
      color: var(--s-color-base-content-secondary) !important;
    }
  }
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
.transaction-lifetime {
  .s-tabs {
    width: auto;
  }
  .el-tabs__item {
    padding: 0 calc($basic-spacing-mini * 2.5) !important;
  }
  .el-tabs__item:not(:hover):not(.is-active) {
    color: var(--s-color-base-content-secondary) !important;
  }
}

.multisig-scrollbar {
  @include scrollbar($basic-spacing-big);
  height: 150px;
  .el-scrollbar__wrap {
    overflow-x: unset;
  }
}
.multisig-user-address {
  .account-avatar,
  .account-credentials {
    display: none !important;
  }
}

.multisig-duration-trx {
  width: 100%;
  .el-tabs__header,
  .el-tabs__nav,
  .el-tabs__item {
    width: 100% !important;
  }
  .el-tabs__item {
    text-align: center;
  }
}
</style>

<style lang="scss" scoped>
.multisig-wallet {
  display: flex;
  flex-direction: column;
  align-items: left;
  .multisig-title-data {
    font-weight: 800;
    color: var(--s-color-base-content-secondary);
    margin-bottom: 8px;
  }
  .multisig-tooltip {
    &__icon {
      color: var(--s-color-base-content-tertiary);
      &:hover {
        cursor: pointer;
        color: var(--s-color-base-content-secondary);
      }
    }
  }
  .requirement {
    text-align: center;
    margin-bottom: calc($basic-spacing * 2.5);
  }

  .address {
    margin-top: $basic-spacing-big;
  }
  .add-multisig-address {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .address-card {
    display: flex;
    flex-direction: column;
    margin-bottom: $basic-spacing-tiny;
    p:first-of-type {
      font-size: 12px;
      color: var(--s-color-base-content-secondary);
    }
    .formatted-address {
      font-size: 16px !important;
    }
  }

  .multisig-addresses-input {
    display: flex;
    flex-direction: column;
    gap: $inner-spacing-small;
    margin-top: calc($basic-spacing-mini * 1.5);
    margin-bottom: $basic-spacing-extra-mini;
  }
  .add-multisig-address {
    gap: calc($basic-spacing-mini * 1.5);
    margin-top: $basic-spacing-medium;
    margin-bottom: $basic-spacing-big;
    font-size: 16px;
    button {
      width: calc($basic-spacing-medium * 2) !important;
      height: calc($basic-spacing-medium * 2) !important;
      padding: $basic-spacing !important;
    }
  }
  .threshold-amount {
    margin-top: $basic-spacing-medium;
    margin-bottom: $basic-spacing-big;
  }
  .error-message {
    color: var(--s-color-status-error);
  }
}
</style>

<style lang="scss">
$telegram-web-app-width: 500px;
</style>
