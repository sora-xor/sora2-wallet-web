<template>
  <dialog-base :title="'Your contacts'" :visible.sync="isVisible">
    <div v-if="userHasContacts">
      <search-input
        autofocus
        v-model="search"
        :placeholder="'Search by address, name or identity'"
        :maxlength="100"
        class="address-book__search"
        @clear="resetSearch"
      />
      <s-scrollbar class="address-book-scrollbar">
        <div class="address-book__extension-list">
          <span v-if="foundRecordsExtension.length" class="address-book__sections">My extension accounts</span>
          <div v-for="({ address, name, identity }, index) in foundRecordsExtension" :key="index">
            <account-card class="address-book__contact" v-button>
              <template #avatar>
                <wallet-avatar slot="avatar" class="account-gravatar" :address="address" :size="28" />
              </template>
              <template #name>
                <span class="condition">{{ name }}</span>
              </template>
              <template #description>
                <s-tooltip :content="copyTooltip(t('account.walletAddress'))" tabindex="-1">
                  <div class="address-book__address" @click="handleCopyAddress(address, $event)">
                    <p class="first">{{ getFormattedAddress(address) }}</p>
                  </div>
                </s-tooltip>
              </template>
              <s-tooltip border-radius="mini" :content="'On-chain identity'" placement="top" tabindex="-1">
                <div v-if="identity" class="address-book__on-chain-name">{{ identity }}</div>
              </s-tooltip>
              <el-popover popper-class="address-book-popover book-popover" trigger="click" :visible-arrow="false">
                <div class="address-book__option" @click="handleSelectAddress(address, name)">
                  <s-icon name="finance-send-24" size="16" />
                  <span>{{ 'Send tokens' }}</span>
                </div>
                <div class="address-book__option--not-active">
                  <s-icon name="el-icon-edit" />
                  <span>{{ 'Edit contact' }}</span>
                </div>
                <div class="address-book__option--not-active">
                  <s-icon name="el-icon-delete" />
                  <span>{{ 'Delete' }}</span>
                </div>
                <div slot="reference">
                  <s-icon class="options-icon" name="basic-more-vertical-24" />
                </div>
              </el-popover>
            </account-card>
          </div>
        </div>
        <div class="address-book__list" ref="bookRef">
          <span v-if="foundRecords.length" class="address-book__sections">My book</span>
          <div v-for="({ address, name, identity }, index) in foundRecords" :key="index">
            <account-card class="address-book__contact" v-button>
              <template #avatar>
                <wallet-avatar slot="avatar" class="account-gravatar" :address="address" :size="28" />
              </template>
              <template #name>
                <span class="condition">{{ name }}</span>
              </template>
              <template #description>
                <s-tooltip :content="copyTooltip(t('account.walletAddress'))" tabindex="-1">
                  <div class="address-book__address" @click="handleCopyAddress(address, $event)">
                    <p class="first">{{ getFormattedAddress(address) }}</p>
                  </div>
                </s-tooltip>
              </template>
              <s-tooltip border-radius="mini" :content="'On-chain identity'" placement="top" tabindex="-1">
                <div v-if="identity" class="address-book__on-chain-name">{{ identity }}</div>
              </s-tooltip>
              <el-popover popper-class="address-book-popover book-popover" trigger="click" :visible-arrow="false">
                <div class="address-book__option" @click="handleSelectAddress(address, name)">
                  <s-icon name="finance-send-24" size="16" />
                  <span>{{ 'Send tokens' }}</span>
                </div>
                <div class="address-book__option" @click="handleEditRecord(address)">
                  <s-icon name="el-icon-edit" />
                  <span>{{ 'Edit contact' }}</span>
                </div>
                <div class="address-book__option" @click="handleDeleteRecord(address)">
                  <s-icon name="el-icon-delete" />
                  <span>{{ 'Delete' }}</span>
                </div>
                <div slot="reference">
                  <s-icon class="options-icon" name="basic-more-vertical-24" />
                </div>
              </el-popover>
            </account-card>
          </div>
        </div>
        <div v-if="showNoRecordsFound" class="address-book__no-found-records">No records found</div>
      </s-scrollbar>
    </div>
    <div v-else class="address-book__no-contacts">You don’t have any contacts added yet</div>
    <div class="address-book__btn">
      <s-button @click="setContact(null)" class="s-typography-button--large">
        {{ 'Add contact' }}
      </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Ref } from 'vue-property-decorator';

import AccountCard from '../Account/AccountCard.vue';
import AccountList from '../Connection/AccountList.vue';
import WalletAvatar from '../WalletAvatar.vue';
import DialogBase from '../DialogBase.vue';
import WalletAccount from '../Account/WalletAccount.vue';
import SearchInput from '../SearchInput.vue';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import { formatAddress, formatSoraAddress } from '@/util';
import { state, action, mutation } from '../../store/decorators';
import { api } from '@sora-substrate/util';
import { Book, PolkadotJsAccount } from '@/types/common';
import { Extensions } from '@/consts';
@Component({
  components: {
    DialogBase,
    AccountCard,
    AccountList,
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

  @mutation.account.removeAddressFromBook removeAddressFromBook!: (address) => void;

  @action.account.selectExtension selectExtension!: (extension: Extensions) => Promise<void>;

  @Ref('bookRef') private readonly bookRef!: HTMLInputElement;

  setContact(address: Nullable<string>, isEditMode = false): void {
    this.$emit('open-add-contact', address, isEditMode);
  }

  addressBook = [] as any;
  extensionAccounts = [] as any;

  search = '';

  async getIdentity(address: string): Promise<string> {
    const entity = await api.getAccountOnChainIdentity(address);
    if (!entity) return '';

    return entity.legalName;
  }

  async getFormattedAddressBook(book) {
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

  async getFormattedExtensionList(accounts) {
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

  get foundRecords() {
    if (!this.searchValue) return this.addressBook;

    return this.addressBook.filter(
      ({ address = '', name = '', identity = '' }) =>
        address.toLowerCase() === this.searchValue ||
        name.toLowerCase().includes(this.searchValue) ||
        identity.toLowerCase().includes(this.searchValue)
    );
  }

  get foundRecordsExtension() {
    if (!this.searchValue) return this.extensionAccounts;

    return this.extensionAccounts.filter(
      ({ address = '', name = '', identity = '' }) =>
        address.toLowerCase() === this.searchValue ||
        name.toLowerCase().includes(this.searchValue) ||
        identity.toLowerCase().includes(this.searchValue)
    );
  }

  get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  getFormattedAddress(address): string {
    return formatAddress(address);
  }

  get userHasContacts(): boolean {
    return this.addressBook.length || this.extensionAccounts.length;
  }

  get showNoRecordsFound(): boolean {
    return !(this.foundRecords.length || this.foundRecordsExtension.length);
  }

  sortBookAlphabetically(book) {
    return book.sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
  }

  filterRecord(account) {
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
    await this.selectExtension(this.selectedExtension as Extensions);
    this.extensionAccounts = (await this.getFormattedExtensionList(this.polkadotJsAccounts)).filter(this.filterRecord);

    this.$root.$on('updateAddressBook', () => {
      this.updateAddressBook();
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

.address-book-scrollbar.el-scrollbar .el-scrollbar__view {
  padding-left: calc(var(--s-basic-spacing) * 3);
  padding-right: calc(var(--s-basic-spacing));
}
</style>

<style lang="scss" scoped>
.address-book {
  &__btn {
    width: 100%;
    margin-bottom: 16px;
    .el-button {
      width: 100%;
    }
  }

  &__sections {
    display: block;
    font-size: 14px;
    text-transform: uppercase;
    margin: 8px 0;
    font-weight: 500;
    color: var(--s-color-base-content-secondary);
  }

  &__contact {
    margin-bottom: 8px;
    margin-right: 10px;
  }

  &__search {
    margin-bottom: 16px;
  }

  &__on-chain-name {
    border-radius: calc(var(--s-border-radius-mini) / 2);
    padding: $inner-spacing-mini;
    background-color: var(--s-color-utility-surface);
    color: var(--s-color-base-content-secondary);
    &:hover {
      cursor: pointer;
    }
  }

  &__option {
    font-weight: 300;
    font-size: 16px;
    line-height: 200%;
    letter-spacing: -0.02em;

    span {
      margin-left: $inner-spacing-mini;
      font-size: var(--s-font-size-medium);
    }

    &:hover {
      cursor: pointer;
    }

    &:hover i {
      cursor: pointer;
      color: var(--s-color-base-content-primary);
    }

    i {
      color: var(--s-color-base-content-secondary);
    }

    &--not-active {
      color: var(--s-color-base-content-tertiary);

      span {
        margin-left: $inner-spacing-mini;
        font-size: var(--s-font-size-medium);
        font-weight: 300;
        font-size: 16px;
        line-height: 200%;
        letter-spacing: -0.02em;
      }
    }

    &--not-active:hover {
      cursor: not-allowed;
    }
  }

  &__address:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  &__no-contacts {
    color: var(--s-color-base-content-secondary);
    font-size: 16px;
    text-align: center;
    height: 150px;
    line-height: 120px;
  }

  &__no-found-records {
    text-align: center;
    color: var(--s-color-base-content-secondary);
    margin-top: 8px;
    font-size: 15px;
  }

  &-scrollbar {
    margin-left: calc(calc(var(--s-basic-spacing) * 3) * -1);
    margin-right: calc(calc(var(--s-basic-spacing) * 3) * -1);
    height: 400px;
  }
}
.options-icon {
  color: var(--s-color-base-content-tertiary);
  &:hover {
    cursor: pointer;
  }
}
</style>
