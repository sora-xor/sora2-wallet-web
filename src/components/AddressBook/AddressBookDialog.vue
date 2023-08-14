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
        <div v-if="extensionAccountsFiltered.length" class="address-book__extension-list">
          <span class="address-book__sections">
            {{ t('addressBook.myExtAccounts') }}
          </span>
          <div v-for="(record, index) in extensionAccountsFiltered" :key="index">
            <address-record :record="record" @click.native="handleSelectAddress(record)">
              <s-button v-if="record.isConnected" size="small" disabled>
                {{ t('connection.wallet.connected') }}
              </s-button>
              <account-actions-menu :actions="accountActions" @select="handleContactAction($event, record)" />
            </address-record>
          </div>
        </div>
        <div v-if="addressBookFiltered.length" class="address-book__list">
          <span class="address-book__sections">{{ t('addressBook.myBook') }}</span>
          <div v-for="(record, index) in addressBookFiltered" :key="index">
            <address-record :record="record" @click.native="handleSelectAddress(record)">
              <account-actions-menu :actions="contactActions" @select="handleContactAction($event, record)" />
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
import { Component, Mixins, Watch } from 'vue-property-decorator';

import { AccountActionTypes } from '../../consts';
import { state, action, mutation, getter } from '../../store/decorators';
import { formatSoraAddress } from '../../util';
import AccountActionsMenu from '../Account/ActionsMenu.vue';
import DialogBase from '../DialogBase.vue';
import SearchInput from '../Input/SearchInput.vue';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

import AddressRecord from './AddressRecord.vue';

import type { AppWallet } from '../../consts';
import type { AccountBook, Book, PolkadotJsAccount } from '../../types/common';

type AccountRecord = AccountBook & {
  isConnected: boolean;
};

@Component({
  components: {
    DialogBase,
    AccountActionsMenu,
    AddressRecord,
    SearchInput,
  },
})
export default class AddressBookDialog extends Mixins(CopyAddressMixin, DialogMixin, TranslationMixin) {
  @state.account.book private book!: Book;
  @state.account.source private selectedExtension!: string;
  @state.account.polkadotJsAccounts private polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @mutation.account.removeAddressFromBook private removeAddressFromBook!: (address: string) => void;

  @action.account.selectWallet private selectWallet!: (extension: AppWallet) => Promise<void>;
  @action.account.resetSelectedWallet private resetSelectedWallet!: FnWithoutArgs;

  @getter.account.isConnectedAccount private isConnectedAccount!: (account: PolkadotJsAccount) => boolean;

  readonly accountActions = [AccountActionTypes.BookSend];
  readonly contactActions = [AccountActionTypes.BookSend, AccountActionTypes.BookEdit, AccountActionTypes.BookDelete];

  identities: Record<string, string> = {};

  @Watch('book')
  private updateBookIdentities(book: Book) {
    Object.keys(book).forEach((address) => this.updateIdentity(address));
  }

  @Watch('polkadotJsAccounts')
  private updateAccountsIdentities(polkadotJsAccounts: Array<PolkadotJsAccount>) {
    polkadotJsAccounts.forEach(({ address }) => this.updateIdentity(address));
  }

  search = '';

  get addressBook(): AccountRecord[] {
    const accounts = Object.entries(this.book).map(([address, name]) => ({ address, name }));

    return this.prepareRecords(accounts);
  }

  get addressBookFiltered() {
    return this.foundRecords(this.addressBook);
  }

  get extensionAccounts() {
    return this.prepareRecords(this.polkadotJsAccounts);
  }

  get extensionAccountsFiltered() {
    return this.foundRecords(this.extensionAccounts);
  }

  get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  get userHasContacts(): boolean {
    return !!this.addressBook.length || !!this.extensionAccounts.length;
  }

  get showNoRecordsFound(): boolean {
    return !(this.addressBookFiltered.length || this.extensionAccountsFiltered.length);
  }

  private async updateIdentity(address: string): Promise<void> {
    const key = formatSoraAddress(address);

    if (key in this.identities) return;

    const entity = await api.getAccountOnChainIdentity(key);
    const identity = entity ? entity.legalName : '';

    this.identities[key] = identity;
  }

  private formatAccount(account: AccountBook): AccountRecord {
    const soraAddress = formatSoraAddress(account.address);

    return {
      address: soraAddress,
      name: account.name,
      identity: this.identities[soraAddress],
      isConnected: this.isConnectedAccount(account),
    };
  }

  private prepareRecords(accounts: AccountBook[]): AccountRecord[] {
    const records = accounts.map((account) => this.formatAccount(account));
    const sorted = records.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));

    return sorted;
  }

  private foundRecords(records: AccountRecord[]) {
    if (!this.searchValue) return records;

    return records.filter(
      ({ address = '', name = '', identity = '' }) =>
        address.toLowerCase() === this.searchValue ||
        name.toLowerCase().includes(this.searchValue) ||
        identity.toLowerCase().includes(this.searchValue)
    );
  }

  resetSearch(): void {
    this.search = '';
  }

  handleSelectAddress(record: AccountBook): void {
    this.$emit('choose-address', record);
    this.closeDialog();
  }

  handleContactAction(actionType: string, { address, name }: AccountBook): void {
    switch (actionType) {
      case AccountActionTypes.BookSend: {
        this.handleSelectAddress({ address, name });
        break;
      }
      case AccountActionTypes.BookEdit: {
        this.setContact(address, true);
        break;
      }
      case AccountActionTypes.BookDelete: {
        this.removeAddressFromBook(address);
        break;
      }
    }
  }

  setContact(address: Nullable<string>, isEditMode = false): void {
    this.$emit('open-add-contact', address, isEditMode);
  }

  async mounted(): Promise<void> {
    await this.selectWallet(this.selectedExtension as AppWallet);
  }

  beforeDestroy(): void {
    this.resetSelectedWallet();
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
    margin-top: calc($basic-spacing * 2);
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
