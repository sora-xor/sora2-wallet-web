<template>
  <dialog-base :title="t('addressBook.dialogTitle')" :visible.sync="isVisible">
    <template v-if="userHasContacts">
      <search-input
        autofocus
        v-model="search"
        :placeholder="t('addressBook.searchPlaceholder')"
        :maxlength="100"
        class="address-book__search"
        @clear="resetSearch"
      />
      <s-scrollbar class="address-book-scrollbar">
        <div v-if="accountBookFiltered.length" class="address-book__extension-list">
          <span class="address-book__sections">
            {{ t('addressBook.myExtAccounts') }}
          </span>
          <div v-for="(record, index) in accountBookFiltered" :key="index">
            <address-record :record="record" @click.native="selectRecord(record)">
              <account-actions-menu :actions="accountActions" @select="handleContactAction($event, record)" />
            </address-record>
          </div>
        </div>
        <div v-if="addressBookFiltered.length" class="address-book__list">
          <span class="address-book__sections">{{ t('addressBook.myBook') }}</span>
          <div v-for="(record, index) in addressBookFiltered" :key="index">
            <address-record :record="record" @click.native="selectRecord(record)">
              <account-actions-menu :actions="contactActions" @select="handleContactAction($event, record)" />
            </address-record>
          </div>
        </div>
        <div v-if="showNoRecordsFound" class="address-book__no-found-records">
          {{ t('addressBook.noFoundRecords') }}
        </div>
      </s-scrollbar>
    </template>
    <div v-else class="address-book__no-contacts">{{ t('addressBook.noContacts') }}</div>
    <s-button @click="setContact(null)" class="address-book__btn s-typography-button--large">
      {{ t('addressBook.addContact') }}
    </s-button>
  </dialog-base>
</template>

<script lang="ts">
import { api } from '@sora-substrate/util';
import { Component, Mixins, Watch, Prop } from 'vue-property-decorator';

import { AccountActionTypes } from '../../consts';
import { formatSoraAddress } from '../../util';
import AccountActionsMenu from '../Account/ActionsMenu.vue';
import DialogBase from '../DialogBase.vue';
import SearchInput from '../Input/SearchInput.vue';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

import AddressRecord from './AddressRecord.vue';

import type { AccountBook, PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
    AccountActionsMenu,
    AddressRecord,
    SearchInput,
  },
})
export default class AddressBookDialog extends Mixins(CopyAddressMixin, DialogMixin, TranslationMixin) {
  @Prop({ default: () => [], type: Array }) readonly accounts!: PolkadotJsAccount[];
  @Prop({ default: () => [], type: Array }) readonly records!: PolkadotJsAccount[];
  @Prop({ default: '', type: String }) readonly excludedAddress!: string;

  readonly accountActions = [AccountActionTypes.BookSend];
  readonly contactActions = [AccountActionTypes.BookSend, AccountActionTypes.BookEdit, AccountActionTypes.BookDelete];

  private identities: Record<string, string> = {};

  @Watch('accounts')
  @Watch('records')
  private async updateIdentities(items: PolkadotJsAccount[]): Promise<void> {
    await Promise.all(items.map(({ address }) => this.updateIdentity(address)));
  }

  search = '';

  get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  get addressBook(): AccountBook[] {
    return this.prepareRecords(this.records);
  }

  get addressBookFiltered(): AccountBook[] {
    return this.foundRecords(this.addressBook);
  }

  get accountBook(): AccountBook[] {
    return this.prepareRecords(this.accounts);
  }

  get accountBookFiltered(): AccountBook[] {
    return this.foundRecords(this.accountBook);
  }

  get userHasContacts(): boolean {
    return !!this.addressBook.length || !!this.accountBook.length;
  }

  get showNoRecordsFound(): boolean {
    return !(this.addressBookFiltered.length || this.accountBookFiltered.length);
  }

  private async updateIdentity(address: string): Promise<void> {
    const key = formatSoraAddress(address);

    if (key in this.identities) return;

    const entity = await api.getAccountOnChainIdentity(key);
    const identity = entity ? entity.legalName : '';

    this.identities[key] = identity;
  }

  private formatAccount(account: PolkadotJsAccount): AccountBook {
    const soraAddress = formatSoraAddress(account.address);

    return {
      address: soraAddress,
      name: account.name,
      identity: this.identities[soraAddress],
    };
  }

  private prepareRecords(accounts: PolkadotJsAccount[]): AccountBook[] {
    const records = accounts.map((account) => this.formatAccount(account));
    const filtered = records.filter((record) => record.address !== this.excludedAddress);
    const sorted = filtered.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));

    return sorted;
  }

  private foundRecords(records: AccountBook[]): AccountBook[] {
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

  selectRecord(record: AccountBook): void {
    this.$emit('select', record);
    this.closeDialog();
  }

  setContact(address: Nullable<string>, isEditMode = false): void {
    this.$emit('open', address, isEditMode);
  }

  removeAddressFromBook(address: string): void {
    this.$emit('remove', address);
  }

  handleContactAction(actionType: string, { address, name }: AccountBook): void {
    switch (actionType) {
      case AccountActionTypes.BookSend: {
        this.selectRecord({ address, name });
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
