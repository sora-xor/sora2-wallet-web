<template>
  <dialog-base :title="title" :visible.sync="isVisible" :tooltip="tooltip">
    <div class="set-address">
      <s-input
        ref="address"
        class="set-address__input"
        :placeholder="t('nameText')"
        v-model="name"
        :disabled="loading"
        :maxlength="30"
      />
      <s-input class="set-address__input" :placeholder="t('addressText')" v-model="address" :disabled="inputDisabled" />
      <p v-if="isAccountAddress" class="set-address-error">{{ t('walletSend.addressError') }}</p>
      <s-input
        class="set-address__input"
        :placeholder="t('addressBook.identity')"
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

import { state, getter, mutation } from '@/store/decorators';
import { formatSoraAddress } from '@/util';

import { api } from '../../api';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import TranslationMixin from '../mixins/TranslationMixin';

import type { AccountBook, Book, PolkadotJsAccount } from '@/types/common';

@Component({
  components: {
    DialogBase,
  },
})
export default class SetContactDialog extends Mixins(DialogMixin, TranslationMixin, LoadingMixin) {
  @state.account.book book!: Book;
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @getter.account.account account!: PolkadotJsAccount;
  @mutation.account.setAddressToBook setAddressToBook!: (record: AccountBook) => void;

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

  @Watch('address')
  async handleAddressInput(address: string): Promise<void> {
    if (!api.validateAddress(address)) {
      this.onChainIdentity = this.t('addressBook.none');
      return;
    }

    const entity = await api.getAccountOnChainIdentity(address);
    this.onChainIdentity = entity ? entity.legalName : this.t('addressBook.none');
  }

  address = '';
  name = '';
  onChainIdentity = this.t('addressBook.none');

  setContact(): void {
    this.setAddressToBook({ address: this.address, name: this.name });
    this.$root.$emit('updateAddressBook');
    this.closeDialog();
    this.$emit('open-address-book');
  }

  get title(): string {
    return this.isEditMode ? this.t('addressBook.options.edit') : this.t('addressBook.addContact');
  }

  get tooltip(): string {
    return this.t('addressBook.tooltip');
  }

  get btnText(): string {
    if (!this.name) return this.t('addressBook.btn.enterName');
    if (!this.validAddress) {
      return this.t(`walletSend.${this.emptyAddress ? 'enterAddress' : 'badAddress'}`);
    }

    if (this.isAddressAdded(this.address) && !this.isEditMode) return this.t('addressBook.btn.present');
    return this.isEditMode ? this.t('addressBook.btn.saveChanges') : this.t('saveText');
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
    margin-bottom: $basic-spacing;

    .s-input__input .el-input.is-disabled .el-input__inner {
      cursor: default;
      color: var(--s-color-base-content-primary);
    }
  }

  &__btn {
    width: 100%;
    margin-bottom: calc($basic-spacing * 2);
    .el-button {
      width: 100%;
    }
  }

  &-error {
    color: var(--s-color-status-error);
    margin-bottom: var(--s-basic-spacing);
    font-size: var(--s-font-size-extra-small);
    line-height: var(--s-line-height-base);
    font-weight: 400;
  }
}
</style>
