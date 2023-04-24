<template>
  <dialog-base :title="title" :visible.sync="isVisible" :tooltip="'this is very important feature'">
    <div class="set-address">
      <s-input
        ref="address"
        class="set-address__input"
        :placeholder="'Name'"
        v-model="name"
        :disabled="loading"
        :maxlength="30"
      />
      <s-input class="set-address__input" :placeholder="'Address'" v-model="address" :disabled="inputDisabled" />
      <p v-if="isAccountAddress" class="set-address-error">{{ t('walletSend.addressError') }}</p>
      <s-input
        class="set-address__input"
        :placeholder="'On-chain identity'"
        v-model="onChainIdentity"
        :disabled="true"
      />
      <div class="set-address__btn">
        <s-button @click="setContact" type="primary" class="s-typography-button--large" :disabled="btnDisabled">
          {{ btnText }}
        </s-button>
      </div>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator';

import DialogBase from '../DialogBase.vue';
import { api } from '../../api';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import { formatSoraAddress } from '@/util';
import { state, getter, mutation } from '@/store/decorators';
import { Book, PolkadotJsAccount } from '@/types/common';

@Component({
  components: {
    DialogBase,
  },
})
export default class SetContactDialog extends Mixins(DialogMixin, TranslationMixin, LoadingMixin) {
  @state.account.book book!: Book;
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @getter.account.account account!: any;
  @mutation.account.setAddressToBook setAddressToBook!: (record) => void;

  @Prop({ default: '', type: String }) readonly prefilledAddress!: string;
  @Prop({ default: false, type: Boolean }) readonly isEditMode!: boolean;

  @Ref('address') private readonly addressInput!: HTMLInputElement;

  @Watch('isVisible')
  async handlePrefilledValues(isVisible: boolean): Promise<void> {
    if (!isVisible) {
      this.address = '';
      this.name = '';
      return;
    }

    if (this.prefilledAddress) {
      this.address = this.prefilledAddress;
      this.name = this.book[this.prefilledAddress];
    }

    await this.$nextTick();
    this.addressInput.focus();
  }

  address = '';
  name = '';
  onChainIdentity = 'None';

  setContact(): void {
    this.setAddressToBook({ address: this.address, name: this.name });
    this.$root.$emit('updateAddressBook');
    this.closeDialog();
    this.$emit('open-address-book');
  }

  get title(): string {
    return this.isEditMode ? 'Edit contact' : 'Add address';
  }

  get btnText(): string {
    if (!this.name) return 'Enter name';
    if (!this.validAddress) {
      return this.t(`walletSend.${this.emptyAddress ? 'enterAddress' : 'badAddress'}`);
    }

    if (this.isAddressAdded(this.address) && !this.isEditMode) return 'Already present';
    return this.isEditMode ? 'Save changes' : 'Save';
  }

  get btnDisabled(): boolean {
    if (
      !this.validAddress ||
      !this.address ||
      !this.name ||
      this.isAccountAddress ||
      this.isAddressAdded(this.address)
    ) {
      if (this.isEditMode && this.name) return false;

      return true;
    }
    return false;
  }

  get inputDisabled(): boolean {
    return this.isEditMode;
  }

  isAddressAdded(address: string): boolean {
    const found = this.polkadotJsAccounts.find((account) => formatSoraAddress(account.address) === address);
    return !!this.book[address] || Boolean(found);
  }

  get emptyAddress(): boolean {
    return !this.address.trim();
  }

  get isAccountAddress(): boolean {
    return [this.address, this.formattedSoraAddress].includes(this.account.address);
  }

  get formattedSoraAddress(): string {
    if (this.emptyAddress) {
      return '';
    }
    try {
      return formatSoraAddress(this.address);
    } catch {
      return '';
    }
  }

  get validAddress(): boolean {
    if (this.emptyAddress) {
      return false;
    }
    return api.validateAddress(this.address) && !this.isAccountAddress;
  }
}
</script>

<style lang="scss">
.set-address {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &__input {
    margin-bottom: 8px;

    .s-input__input .el-input.is-disabled .el-input__inner {
      cursor: default;
      color: var(--s-color-base-content-primary);
    }
  }

  &__btn {
    width: 100%;
    margin-bottom: 16px;
    .el-button {
      width: 100%;
    }
  }

  &-error {
    color: var(--s-color-status-error);
    margin-bottom: var(--s-basic-spacing);
    font-weight: 400;
    font-size: var(--s-font-size-extra-small);
    line-height: var(--s-line-height-base);
  }
}
</style>
