<template>
  <dialog-base :title="t('addressBook.dialogTitle')" :visible.sync="isVisible" append-to-body>
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
        <div v-if="accountBookFiltered.length" class="address-book__list">
          <span class="address-book__sections">
            {{ t('addressBook.myAccounts') }}
          </span>
          <wallet-account
            v-for="(record, index) in accountBookFiltered"
            :key="index"
            with-identity
            :polkadot-account="record"
            @click.native="selectRecord(record)"
            @identity="updateIdentity($event, record.address)"
            class="address-book__list-item"
          >
            <account-actions-menu :actions="accountActions" @select="handleContactAction($event, record)" />
          </wallet-account>
        </div>
        <div v-if="addressBookFiltered.length" class="address-book__list">
          <span class="address-book__sections">{{ t('addressBook.myBook') }}</span>
          <wallet-account
            v-for="(record, index) in addressBookFiltered"
            :key="index"
            with-identity
            :polkadot-account="record"
            @click.native="selectRecord(record)"
            class="address-book__list-item"
          >
            <account-actions-menu :actions="contactActions" @select="handleContactAction($event, record)" />
          </wallet-account>
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
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { AccountActionTypes } from '../../consts';
import { formatSoraAddress } from '../../util';
import AccountActionsMenu from '../Account/ActionsMenu.vue';
import WalletAccount from '../Account/WalletAccount.vue';
import DialogBase from '../DialogBase.vue';
import SearchInput from '../Input/SearchInput.vue';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

import type { PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
    AccountActionsMenu,
    WalletAccount,
    SearchInput,
  },
})
export default class AddressBookList extends Mixins(CopyAddressMixin, DialogMixin, TranslationMixin) {
  @Prop({ default: () => [], type: Array }) readonly accounts!: PolkadotJsAccount[];
  @Prop({ default: () => [], type: Array }) readonly records!: PolkadotJsAccount[];
  @Prop({ default: '', type: String }) readonly excludedAddress!: string;

  readonly accountActions = [AccountActionTypes.BookSend];
  readonly contactActions = [AccountActionTypes.BookSend, AccountActionTypes.BookEdit, AccountActionTypes.BookDelete];

  search = '';
  identities: Record<string, string> = {};

  get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  get addressBook(): PolkadotJsAccount[] {
    return this.prepareRecords(this.records, this.identities);
  }

  get addressBookFiltered(): PolkadotJsAccount[] {
    return this.foundRecords(this.addressBook);
  }

  get accountBook(): PolkadotJsAccount[] {
    return this.prepareRecords(this.accounts, this.identities);
  }

  get accountBookFiltered(): PolkadotJsAccount[] {
    return this.foundRecords(this.accountBook);
  }

  get userHasContacts(): boolean {
    return !!this.addressBook.length || !!this.accountBook.length;
  }

  get showNoRecordsFound(): boolean {
    return !(this.addressBookFiltered.length || this.accountBookFiltered.length);
  }

  private formatAccount(account: PolkadotJsAccount, identities: Record<string, string>): PolkadotJsAccount {
    const address = formatSoraAddress(account.address);
    const identity = identities[address];

    return {
      address,
      name: account.name,
      identity,
    };
  }

  private prepareRecords(accounts: PolkadotJsAccount[], identities: Record<string, string>): PolkadotJsAccount[] {
    const records = accounts.map((account) => this.formatAccount(account, identities));
    const filtered = records.filter((record) => record.address !== this.excludedAddress);
    const sorted = [...filtered].sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));

    return sorted;
  }

  private foundRecords(records: PolkadotJsAccount[]): PolkadotJsAccount[] {
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

  selectRecord(record: PolkadotJsAccount): void {
    this.$emit('select', record);
    this.closeDialog();
  }

  setContact(address: Nullable<string>, isEditMode = false): void {
    this.$emit('open', address, isEditMode);
  }

  removeAddressFromBook(address: string): void {
    this.$emit('remove', address);
  }

  updateIdentity(identity: string, address: string): void {
    this.identities = { ...this.identities, [address]: identity };
  }

  handleContactAction(actionType: string, { address, name }: PolkadotJsAccount): void {
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
.address-book-scrollbar {
  @include scrollbar($basic-spacing-big);
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

  &__list {
    &-item {
      &.account-card.s-card.neumorphic {
        border-width: 1px;

        &:hover {
          cursor: pointer;
          border-color: var(--s-color-base-content-secondary);
        }
      }

      & + & {
        margin-top: $basic-spacing;
      }
    }
  }
}
</style>
