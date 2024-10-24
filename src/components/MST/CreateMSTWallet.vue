<template>
  <wallet-base
    show-back
    title="Multisig Wallet"
    :show-header="showHeader"
    @back="handleBack"
    tooltip="A multisig wallet is a crypto wallet that requires multiple approvals to authorize transactions, enhancing security and shared control."
  >
    <div class="multisig-wallet">
      <p class="requirement">Create a wallet that requires multiple signatures of a minimum of 3 addresses.</p>
      <s-input placeholder="Enter Multisig Wallet Name" :minlength="1" v-model="multisigName" />

      <div class="multisig-addresses">
        <p class="multisig-title-data">
          ADD MULTISIG ADDRESSES ({{ filledAddressesCount }}/{{ totalNumberOfAddresses }})
        </p>
        <s-tooltip slot="suffix" popper-class="multisig-tooltip" content="Should be addresses" placement="bottom">
          <s-icon class="multisig-tooltip__icon" name="info-16" size="18px" />
        </s-tooltip>
      </div>

      <s-card v-bind="{ shadow: 'always', size: 'medium', borderRadius: 'small', ...$attrs }" class="address-card">
        <p>Your address</p>
        <p>{{ accountAddress }}</p>
      </s-card>

      <s-scrollbar class="multisig-scrollbar">
        <div class="multisig-addresses-input">
          <div v-for="(address, index) in multisigAddresses" :key="index + 1">
            <address-book-input
              exclude-connected
              v-model="multisigAddresses[index]"
              :is-valid="validAddress(address)"
              prop-placeholder="Enter the multisig address"
            />
          </div>
        </div>
      </s-scrollbar>

      <div class="add-multisig-address">
        <s-button type="secondary" tooltip="Add address" @click="addAddress">
          <s-icon name="plus-16" size="14" />
        </s-button>
        <p>Add another address</p>
      </div>

      <div class="multisig-threshold">
        <p class="multisig-title-data">SET A TRANSACTION APPROVAL THRESHOLD</p>
        <s-tooltip slot="suffix" popper-class="multisig-tooltip" content="How much threshold" placement="bottom">
          <s-icon class="multisig-tooltip__icon" name="info-16" size="18px" />
        </s-tooltip>
      </div>

      <s-input placeholder="1" type="number" v-model="amountOfThreshold" class="threshold-amount">
        <template v-slot:suffix> /{{ totalNumberOfAddresses }} </template>
      </s-input>
      <div class="transaction-lifetime">
        <p class="multisig-title-data">TRANSACTION LIFETIME</p>
        <s-tabs v-model="transactionLifetime" type="rounded" class="save-password-durations">
          <s-tab v-for="duration in durations" :key="duration" :label="duration" :name="duration" />
        </s-tabs>
      </div>
      <s-button :type="isButtonEnabled() ? 'primary' : 'tertiary'" :disabled="!isButtonEnabled()" @click="handleClick">
        SET UP THE DETAILS
      </s-button>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';

import { PolkadotJsAccount } from '@/types/common';

import { RouteNames, TransactionLifetimeMST, TransactionLifetimeMSTDuration } from '../../consts';
import { getter, mutation } from '../../store/decorators';
import { validateAddress } from '../../util';
import AddressBookInput from '../AddressBook/Input.vue';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletBase from '../WalletBase.vue';

import type { Route } from '../../store/router/types';

@Component({
  components: {
    WalletBase,
    AddressBookInput,
  },
})
export default class CreateMSTWallet extends Mixins(TranslationMixin) {
  showHeader = true;
  multisigName = '';
  transactionLifetime: string | null = null;
  multisigAddresses: string[] = [''];
  amountOfThreshold: number | null = null;
  readonly durations = TransactionLifetimeMST;

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
    const isTransactionLifetimeSelected = Boolean(this.transactionLifetime && this.transactionLifetime !== '0');
    return isMultisigNameFilled && areAllAddressesFilled && isThresholdSet && isTransactionLifetimeSelected;
  }

  get totalNumberOfAddresses(): number {
    return this.multisigAddresses.length + 1;
  }

  get filledAddressesCount(): number {
    const filledExternalAddresses = this.multisigAddresses.filter((address) => address.trim() !== '').length;
    return filledExternalAddresses + 1;
  }

  get accountAddress(): string {
    return this.account.address;
  }

  public validAddress(address: string): boolean {
    return validateAddress(address);
  }

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }

  handleClick(): void {
    const data = {
      multisigName: this.multisigName,
      addresses: [this.accountAddress, ...this.multisigAddresses],
      threshold: this.amountOfThreshold,
      transactionLifetime: TransactionLifetimeMSTDuration[this.transactionLifetime ?? '1D'],
    };
    console.info(data);
  }

  addAddress(): void {
    this.multisigAddresses.push('');
  }
}
</script>

<style lang="scss">
.threshold-amount {
  .s-input__content {
    width: 50px;
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
    padding: 0 10px !important;
  }
  .el-tabs__item:not(:hover):not(.is-active) {
    color: var(--s-color-base-content-secondary) !important;
  }
}

.multisig-scrollbar {
  @include scrollbar($basic-spacing-big);
  height: 145px;
  .el-scrollbar__wrap {
    overflow-x: unset;
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
    margin-bottom: 21px;
  }
  .multisig-addresses,
  .multisig-threshold {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .multisig-addresses {
    margin-top: 24px;
    margin-bottom: 15px;
  }
  .address-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-bottom: 12px;
    box-shadow: var(--s-shadow-element-pressed) !important;
    p:first-of-type {
      font-size: 12px;
      color: var(--s-color-base-content-secondary);
    }
    font-size: 16px;
    p {
      max-width: 320px;
      word-wrap: break-word;
    }
  }

  .multisig-addresses-input {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .add-multisig-address {
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
    margin-top: 15px;
    margin-bottom: 24px;
    font-size: 16px;
    button {
      width: 31px !important;
      height: 31px !important;
      padding: 8px !important;
    }
  }
  .threshold-amount {
    margin-top: 16px;
    margin-bottom: 24px;
  }
  .transaction-lifetime {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
}
</style>
