<template>
  <div class="address-input">
    <address-record v-if="record" :record="record">
      <s-icon class="book-icon-unlink" name="el-icon-close" size="20" @click.native="unlinkAddress" />
      <s-icon class="book-icon-open is-set" name="basic-user-24" size="18" @click.native="openAddressBook" />
    </address-record>

    <s-input v-else :maxlength="128" :placeholder="t('walletSend.address')" v-model="address">
      <s-icon class="book-icon-open" name="basic-user-24" size="18" @click.native="openAddressBook" slot="right" />
    </s-input>

    <div v-if="newAddressDetected" class="new-address">
      <span class="new-address-msg">{{ t('addressBook.detected') }}</span>
      <span class="new-address-save" @click="saveContact(address)">{{ t('addressBook.save') }}</span>
    </div>

    <address-book-dialog
      :visible.sync="showAddressBookDialog"
      @open-add-contact="saveContact"
      @choose-address="chooseAddress"
    />
    <set-contact-dialog
      :prefilled-address="prefilledAddress"
      :is-edit-mode="isEditMode"
      :visible.sync="showSetContactDialog"
      @open-address-book="openAddressBook"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, ModelSync } from 'vue-property-decorator';

import { state } from '../../store/decorators';
import { formatSoraAddress } from '../../util';
import TranslationMixin from '../mixins/TranslationMixin';

import AddressBookDialog from './AddressBookDialog.vue';
import AddressRecord from './AddressRecord.vue';
import SetContactDialog from './SetContactDialog.vue';

import type { AccountBook, Book, PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    AddressRecord,
    AddressBookDialog,
    SetContactDialog,
  },
})
export default class AddressBookInput extends Mixins(TranslationMixin) {
  @ModelSync('value', 'input', { default: '', type: String })
  readonly address!: string;

  @state.account.book private book!: Book;
  @state.account.polkadotJsAccounts private polkadotJsAccounts!: Array<PolkadotJsAccount>;

  showAddressBookDialog = false;
  showSetContactDialog = false;

  isEditMode = false;

  prefilledAddress = '';
  record: Nullable<AccountBook> = null;

  get newAddressDetected(): boolean {
    if (!this.address) return false;

    const formattedAddress = formatSoraAddress(this.address);
    const found = this.polkadotJsAccounts.find((account) => formatSoraAddress(account.address) === formattedAddress);

    return !this.book[formattedAddress] && !found;
  }

  openAddressBook(): void {
    this.showAddressBookDialog = true;
  }

  updateAddress(address: string): void {
    this.$emit('input', address);
  }

  chooseAddress({ name, address }: AccountBook): void {
    this.record = { name, address };
    this.updateAddress(address);
  }

  saveContact(address: Nullable<string>, isEditMode = false): void {
    this.isEditMode = isEditMode;
    this.prefilledAddress = address ? formatSoraAddress(address) : '';
    this.showSetContactDialog = true;
  }

  unlinkAddress(): void {
    this.record = null;
    this.updateAddress('');
  }
}
</script>

<style lang="scss" scoped>
.new-address {
  background: rgba(248, 8, 123, 0.09);
  height: 50px;
  width: 100%;
  border-radius: 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--s-color-base-content-primary);
  padding: 0 10px;

  &-msg {
    font-weight: 330;
  }

  &-save {
    color: var(--s-color-theme-accent);
    &:hover {
      cursor: pointer;
    }
  }
}

.address-input {
  .new-address {
    margin-top: $basic-spacing;
  }
}

.book-icon-open {
  background: var(--s-color-base-content-tertiary);
  color: var(--s-color-base-background);
  padding: 2px;
  margin-left: 4px;
  border-radius: 4px;

  &:hover {
    cursor: pointer;
    background: var(--s-color-base-content-secondary);
  }

  &.is-set {
    margin-right: 3px;
  }
}

.book-icon-unlink {
  color: var(--s-color-base-content-tertiary);
  margin-right: 6px;
  &:hover {
    cursor: pointer;
    color: var(--s-color-base-content-secondary);
  }
}
</style>
