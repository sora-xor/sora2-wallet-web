<template>
  <wallet-base show-back title="Multisig Wallet" :show-header="showHeader" @back="handleBack">
    <div class="multisig-wallet">
      <!-- <p class="requirement">Create a wallet that requires multiple signatures of a minimum of 3 addresses.</p> -->
      <s-input placeholder="Enter Multisig Wallet Name" :minlength="1" v-model="multisigName" />

      <!-- <p class="multisig-title-data address">
        ADD MULTISIG ADDRESSES ({{ filledAddressesCount }}/{{ totalNumberOfAddresses }})
      </p> -->

      <p class="multisig-title-data address">ADD MULTISIG ADDRESSES</p>

      <account-card class="multisig-user-address">
        <div class="address-card">
          <p>Your address</p>
          <formatted-address :value="accountAddress" :symbols="24" />
        </div>
      </account-card>

      <s-scrollbar class="multisig-scrollbar">
        <div class="multisig-addresses-input">
          <div v-for="(address, index) in multisigAddresses" :key="index + 1">
            <address-book-input
              exclude-connected
              v-model="multisigAddresses[index]"
              :is-valid="validAddress(address)"
              prop-placeholder="Enter the multisig address"
            />
            <p v-if="isDuplicateAddress(index)" class="error-message">This address has already been entered.</p>
            <p v-if="!validAddress(multisigAddresses[index]) && multisigAddresses[index] != ''" class="error-message">
              The address is not in correct format
            </p>
          </div>
        </div>
      </s-scrollbar>

      <div class="add-multisig-address">
        <s-button type="secondary" tooltip="Add address" @click="addAddress">
          <s-icon name="plus-16" size="14" />
        </s-button>
        <p>Add another address</p>
      </div>

      <p class="multisig-title-data">SET A TRANSACTION APPROVAL THRESHOLD</p>

      <s-input placeholder="1" type="number" v-model="amountOfThreshold" class="threshold-amount">
        <template v-slot:suffix> /{{ totalNumberOfAddresses }} </template>
      </s-input>
      <!-- <div class="transaction-lifetime">
        <p class="multisig-title-data">TRANSACTION LIFETIME</p>
        <s-tabs v-model="transactionLifetime" type="rounded" class="save-password-durations">
          <s-tab v-for="duration in durations" :key="duration" :label="duration" :name="duration" />
        </s-tabs>
      </div> -->
      <s-button :type="isButtonEnabled() ? 'primary' : 'tertiary'" :disabled="!isButtonEnabled()" @click="handleClick">
        SET UP THE DETAILS
      </s-button>
    </div>
    <multisig-create-dialog :visible.sync="MSTDialogVisibility" :mst-data="MSTData" :threshold="amountOfThreshold" />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';

import { PolkadotJsAccount } from '@/types/common';

import { RouteNames } from '../../consts';
import { getter, mutation } from '../../store/decorators';
import { validateAddress } from '../../util';
import AccountCard from '../Account/AccountCard.vue';
import AddressBookInput from '../AddressBook/Input.vue';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import WalletBase from '../WalletBase.vue';

import MultisigCreateDialog from './MultisigCreateDialog.vue';

import type { Route } from '../../store/router/types';
import type { MSTData } from '../../types/mst';

@Component({
  components: {
    WalletBase,
    AddressBookInput,
    MultisigCreateDialog,
    AccountCard,
    FormattedAddress,
  },
})
export default class CreateMSTWallet extends Mixins(TranslationMixin) {
  showHeader = true;
  multisigName = '';
  transactionLifetime: string | null = null;
  multisigAddresses: string[] = [''];
  amountOfThreshold: number | null = null;
  MSTDialogVisibility = false;
  MSTData: MSTData = {
    addresses: [],
    multisigName: '',
    threshold: 0,
    // transactionLifetime: 0,
  };

  // readonly durations = TransactionLifetimeMST;

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

  @mutation.router.navigate private navigate!: (options: Route) => void;
  @getter.account.account private account!: PolkadotJsAccount;

  mounted() {
    this.initializeMultisigAddresses();
  }

  initializeMultisigAddresses(): void {
    this.multisigAddresses = ['', ''];
  }

  isButtonEnabled(): boolean {
    const isMultisigNameFilled = this.multisigName.trim() !== '';
    const areAllAddressesFilled = this.multisigAddresses.every((address) => address.trim() !== '');
    const isThresholdSet = this.amountOfThreshold !== null && this.amountOfThreshold > 0;
    const areAllAddressesValid = this.multisigAddresses.every((address) => this.validAddress(address));
    const noDuplicateAddresses = !this.hasDuplicateAddresses();
    // const isTransactionLifetimeSelected = Boolean(this.transactionLifetime && this.transactionLifetime !== '0');
    return (
      isMultisigNameFilled && areAllAddressesFilled && isThresholdSet && noDuplicateAddresses && areAllAddressesValid
    );
  }

  get totalNumberOfAddresses(): number {
    return this.multisigAddresses.length + 1;
  }

  // get filledAddressesCount(): number {
  //   const filledExternalAddresses = this.multisigAddresses.filter((address) => address.trim() !== '').length;
  //   return filledExternalAddresses + 1;
  // }

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

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }

  handleClick(): void {
    this.MSTData = {
      addresses: [this.accountAddress, ...this.multisigAddresses],
      multisigName: this.multisigName,
      threshold: this.amountOfThreshold,
      // transactionLifetime: TransactionLifetimeMSTDuration[this.transactionLifetime ?? '1D'],
    };
    console.info(this.MSTData);
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
    width: calc($basic-spacing-big * 2);
    .el-input__suffix {
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
  height: 155px;
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
</style>

<style lang="scss" scoped>
.multisig-wallet {
  display: flex;
  flex-direction: column;
  align-items: left;
  .multisig-title-data {
    font-weight: 800;
    color: var(--s-color-base-content-secondary);
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
  // .transaction-lifetime {
  //   gap: $inner-spacing-small;
  //   margin-bottom: $basic-spacing-big;
  // }
}
</style>
