<template>
  <dialog-base :title="t('addressBook.dialogTitle')" :visible.sync="isVisible">
    <div v-if="userHasContacts">
      <search-input
        autofocus
        v-model="search"
        :placeholder="t('addressBook.searchPlaceholder')"
        :maxlength="100"
        class="address-book__search"
        @clear="resetSearch"
      />
      <s-scrollbar class="address-book-scrollbar">
        <div class="address-book__extension-list">
          <span v-if="foundRecords(extensionAccounts).length" class="address-book__sections">
            {{ t('addressBook.myExtAccounts') }}
          </span>
          <div v-for="({ address, name, identity }, index) in foundRecords(extensionAccounts)" :key="index">
            <address-record :record="{ address, name, identity }" showIdentity @select-address="handleSelectAddress">
              <options
                :record="{ address, name }"
                :withActiveOptions="false"
                @edit="handleEditRecord"
                @delete="handleDeleteRecord"
                @select-address="handleSelectAddress"
              />
            </address-record>
          </div>
        </div>
        <div class="address-book__list" ref="bookRef">
          <span v-if="foundRecords(addressBook).length" class="address-book__sections">{{
            t('addressBook.myBook')
          }}</span>
          <div v-for="({ address, name, identity }, index) in foundRecords(addressBook)" :key="index">
            <address-record :record="{ address, name, identity }" showIdentity @select-address="handleSelectAddress">
              <options
                :record="{ address, name }"
                :withActiveOptions="true"
                @edit="handleEditRecord"
                @delete="handleDeleteRecord"
                @select-address="handleSelectAddress"
              />
            </address-record>
          </div>
        </div>
        <div v-if="showNoRecordsFound" class="address-book__no-found-records">
          {{ t('addressBook.noFoundRecords') }}
        </div>
      </s-scrollbar>
    </div>
    <div v-else class="address-book__no-contacts">{{ t('addressBook.noContacts') }}</div>
    <div class="address-book__btn">
      <s-button @click="setContact(null)" class="s-typography-button--large">
        {{ t('addressBook.addContact') }}
      </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { api } from '@sora-substrate/util';
import { Component, Mixins, Ref } from 'vue-property-decorator';

import { state, action, mutation } from '../../store/decorators';
import { formatAddress, formatSoraAddress } from '../../util';
import AccountCard from '../Account/AccountCard.vue';
import WalletAccount from '../Account/WalletAccount.vue';
import AccountList from '../Connection/AccountList.vue';
import DialogBase from '../DialogBase.vue';
import SearchInput from '../Input/SearchInput.vue';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletAvatar from '../WalletAvatar.vue';

import AddressRecord from './AddressRecord.vue';
import Options from './Options.vue';

import type { AppWallet } from '../../consts';
import type { AccountBook, Book, PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
    AccountCard,
    AccountList,
    AddressRecord,
    Options,
    WalletAvatar,
    SearchInput,
    WalletAccount,
  },
})
export default class AddressBookDialog extends Mixins(CopyAddressMixin, DialogMixin, TranslationMixin) {
  @state.account.address address!: string;
  @state.account.book book!: Book;
  @state.account.source selectedExtension!: string;
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @mutation.account.removeAddressFromBook removeAddressFromBook!: (address: string) => void;

  @action.account.selectWallet selectWallet!: (extension: AppWallet) => Promise<void>;

  @Ref('bookRef') private readonly bookRef!: HTMLInputElement;

  setContact(address: Nullable<string>, isEditMode = false): void {
    this.$emit('open-add-contact', address, isEditMode);
  }

  addressBook: Array<AccountBook> = [];
  extensionAccounts: Array<AccountBook> = [];

  search = '';

  async getIdentity(address: string): Promise<string> {
    const entity = await api.getAccountOnChainIdentity(address);
    if (!entity) return '';

    return entity.legalName;
  }

  async getFormattedAddressBook(book: Book): Promise<AccountBook[]> {
    return Promise.all(
      Object.entries(book).map(async ([address, name]) => {
        return {
          address,
          name,
          identity: await this.getIdentity(address),
        };
      })
    );
  }

  async getFormattedExtensionList(accounts: Array<PolkadotJsAccount>): Promise<AccountBook[]> {
    return Promise.all(
      accounts.map(async ({ address, name }) => {
        return {
          address: formatSoraAddress(address),
          name,
          identity: await this.getIdentity(address),
        };
      })
    );
  }

  foundRecords(records: AccountBook[]) {
    if (!this.searchValue) return records;

    return records.filter(
      ({ address = '', name = '', identity = '' }) =>
        address.toLowerCase() === this.searchValue ||
        name.toLowerCase().includes(this.searchValue) ||
        identity.toLowerCase().includes(this.searchValue)
    );
  }

  get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  getFormattedAddress(address: string): string {
    return formatAddress(address);
  }

  get userHasContacts(): boolean {
    return !!this.addressBook.length || !!this.extensionAccounts.length;
  }

  get showNoRecordsFound(): boolean {
    return !(this.foundRecords(this.addressBook).length || this.foundRecords(this.extensionAccounts).length);
  }

  sortBookAlphabetically(book: AccountBook[]) {
    return book.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
  }

  filterRecord(account: AccountBook): boolean {
    return account.address !== this.address;
  }

  resetSearch(): void {
    this.search = '';
  }

  handleEditRecord(address: string): void {
    const isEditMode = true;
    this.setContact(address, isEditMode);
    this.closePopover();
  }

  handleDeleteRecord(address: string): void {
    this.removeAddressFromBook(address);
    this.addressBook = this.addressBook.filter((record) => record.address !== address);
    this.closePopover();
  }

  async updateAddressBook(): Promise<void> {
    const formattedBook = (await this.getFormattedAddressBook(this.book)).filter(this.filterRecord);
    this.addressBook = this.sortBookAlphabetically(formattedBook);
  }

  closePopover(): void {
    this.bookRef.click();
  }

  handleSelectAddress(address: string, name: string): void {
    this.$emit('choose-address', address, name);
    this.closePopover();
    this.closeDialog();
  }

  async mounted(): Promise<void> {
    await this.updateAddressBook();
    await this.selectWallet(this.selectedExtension as AppWallet);
    this.extensionAccounts = (await this.getFormattedExtensionList(this.polkadotJsAccounts)).filter(this.filterRecord);

    this.$root.$on('updateAddressBook', () => {
      this.updateAddressBook();
    });

    this.$root.$on('closePopover', () => {
      this.closePopover();
    });
  }
}
</script>

<style lang="scss">
.address-book-popover.book-popover {
  background-color: var(--s-color-utility-body);
  border-radius: $basic-spacing;
  color: var(--s-color-base-content-primary);
  border: none;
  padding: $basic-spacing $inner-spacing-mini $basic-spacing $basic-spacing;
  font-size: var(--s-font-size-small);
}

.address-book-scrollbar {
  @include scrollbar($basic-spacing-big);
}

.address-book-scrollbar.el-scrollbar .el-scrollbar__view {
  padding-left: calc(var(--s-basic-spacing) * 3);
  padding-right: calc(var(--s-basic-spacing) * 2);
}
</style>

<style lang="scss" scoped>
.address-book {
  &__btn {
    width: 100%;
    margin-bottom: calc($basic-spacing * 2);
    .el-button {
      width: 100%;
    }
  }

  &__sections {
    display: block;
    font-size: var(--s-font-size-small);
    text-transform: uppercase;
    margin: $basic-spacing 0;
    font-weight: 500;
    color: var(--s-color-base-content-secondary);
  }

  &__search {
    margin-bottom: calc($basic-spacing * 2);
  }

  &__no-contacts {
    color: var(--s-color-base-content-secondary);
    font-size: var(--s-font-size-medium);
    text-align: center;
    height: 150px;
    line-height: 120px;
  }

  &__no-found-records {
    text-align: center;
    color: var(--s-color-base-content-secondary);
    margin-top: $basic-spacing;
    font-size: var(--s-font-size-medium);
  }

  &-scrollbar {
    height: 400px;
  }
}
</style>
