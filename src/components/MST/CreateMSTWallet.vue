<template>
  <wallet-base show-back title="Multisig Wallet" :show-header="showHeader" @back="handleBack" tooltip="The MST Wallet">
    <div class="multisig-wallet">
      <p class="requirement">
        Create a wallet that requires multiple signatures of a minimum of {{ totalNumberOfAddresses }} addresses.
      </p>
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

      <div class="multisig-addresses-input">
        <div v-for="(address, index) in multisigAddresses" :key="index + 1" class="multisig-address-input">
          <s-input placeholder="Enter the multisig address" :minlength="1" v-model="multisigAddresses[index]" />
        </div>
      </div>

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

      <!-- Add a check if it's negative or smth not between 0 and totalNumberOfAddresses-->
      <s-input
        placeholder="0"
        type="number"
        :min="0"
        :max="totalNumberOfAddresses"
        v-model="amountOfThreshold"
        class="threshold-amount"
      >
        <template v-slot:suffix> /{{ totalNumberOfAddresses }} </template>
      </s-input>
      <div>
        <p class="multisig-title-data">TRANSACTION LIFETIME</p>
      </div>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';

import { PolkadotJsAccount } from '@/types/common';

import { RouteNames } from '../../consts';
import { getter, mutation } from '../../store/decorators';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletBase from '../WalletBase.vue';

import type { Route } from '../../store/router/types';

@Component({
  components: {
    WalletBase,
  },
})
export default class CreateMSTWallet extends Mixins(TranslationMixin) {
  showHeader = true;
  multisigName = '';
  multisigAddresses: string[] = [''];
  amountOfThreshold: number | null = null;

  @Watch('amountOfThreshold')
  private onAmountOfThresholdUpdate(value: number | null): void {
    if (value !== null && value > this.totalNumberOfAddresses) {
      this.amountOfThreshold = this.totalNumberOfAddresses;
    }
    if (value !== null && value < 0) {
      this.amountOfThreshold = 0;
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

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
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
}
</style>
