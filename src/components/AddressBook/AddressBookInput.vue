<template>
  <div class="address-input">
    <address-record v-if="record" :record="record">
      <s-icon class="book-icon-unlink" name="el-icon-close" size="20" @click.native="unlinkAddress" />
      <s-icon class="book-icon-open" name="basic-user-24" size="18" @click.native="openAddressBook" />
    </address-record>

    <s-input
      v-else
      v-model="address"
      v-bind="{
        maxlength: 128,
        placeholder: t('walletSend.address'),
        borderRadius: 'medium',
        ...$attrs,
      }"
    >
      <template #right>
        <s-icon v-if="address" class="book-icon-unlink" name="el-icon-close" size="20" @click.native="unlinkAddress" />
        <s-icon class="book-icon-open" name="basic-user-24" size="18" @click.native="openAddressBook" />
      </template>
    </s-input>

    <div v-if="newAddressDetected" class="new-address">
      <span class="new-address-msg">{{ t('addressBook.detected') }}</span>
      <span class="new-address-save" @click="openContact(address)">{{ t('addressBook.save') }}</span>
    </div>

    <address-book-dialog
      :visible.sync="showAddressBookDialog"
      :accounts="accountsRecords"
      :records="bookRecords"
      :excluded-address="excludedAddress"
      @open="openContact"
      @select="chooseAddress"
      @remove="removeAddressFromBook"
    />
    <set-contact-dialog
      :accounts="accountsRecords"
      :book="book"
      :prefilled-address="prefilledAddress"
      :is-edit-mode="isEditMode"
      :visible.sync="showSetContactDialog"
      @add="setAddressToBook"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, ModelSync, Prop } from 'vue-property-decorator';

import { mutation, state } from '../../store/decorators';
import { formatSoraAddress, subscribeToWalletAccounts } from '../../util';
import SearchInput from '../Input/SearchInput.vue';
import TranslationMixin from '../mixins/TranslationMixin';

import AddressBookDialog from './AddressBookDialog.vue';
import AddressRecord from './AddressRecord.vue';
import SetContactDialog from './SetContactDialog.vue';

import type { AppWallet } from '../../consts';
import type { AccountBook, Book, PolkadotJsAccount } from '../../types/common';

@Component({
  inheritAttrs: false,
  components: {
    SearchInput,
    AddressRecord,
    AddressBookDialog,
    SetContactDialog,
  },
})
export default class AddressBookInput extends Mixins(TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly excludeConnected!: boolean;

  @ModelSync('value', 'input', { default: '', type: String })
  readonly address!: string;

  @state.account.address private connected!: string;
  @state.account.book private book!: Book;
  @state.account.source private source!: AppWallet;

  @mutation.account.setAddressToBook setAddressToBook!: (record: AccountBook) => void;
  @mutation.account.removeAddressFromBook removeAddressFromBook!: (address: string) => void;

  showAddressBookDialog = false;
  showSetContactDialog = false;

  isEditMode = false;

  prefilledAddress = '';
  record: Nullable<AccountBook> = null;

  accountsSubscription: Nullable<any> = null;
  accountsRecords: PolkadotJsAccount[] = [];

  get bookRecords(): PolkadotJsAccount[] {
    return Object.entries(this.book).map(([address, name]) => ({ address, name }));
  }

  get newAddressDetected(): boolean {
    if (!this.address) return false;

    try {
      const formattedAddress = formatSoraAddress(this.address);
      const found = this.accountsRecords.find((account) => formatSoraAddress(account.address) === formattedAddress);

      return !this.book[formattedAddress] && !found;
    } catch {
      return false;
    }
  }

  get excludedAddress(): string {
    return this.excludeConnected ? this.connected : '';
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

  openContact(address: Nullable<string>, isEditMode = false): void {
    this.isEditMode = isEditMode;
    this.prefilledAddress = address ? formatSoraAddress(address) : '';
    this.showSetContactDialog = true;
  }

  unlinkAddress(): void {
    this.record = null;
    this.updateAddress('');
  }

  async mounted(): Promise<void> {
    this.accountsSubscription = await subscribeToWalletAccounts(this.source, (accounts) => {
      this.accountsRecords = accounts;
    });
  }

  beforeDestroy(): void {
    if (this.accountsSubscription) {
      this.accountsSubscription();
      this.accountsSubscription = null;
      this.accountsRecords = [];
    }
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
