<template>
  <div class="address-input">
    <wallet-account v-if="record" :polkadot-account="record">
      <s-icon class="book-icon-unlink" name="el-icon-close" size="20" @click.native="resetAddress" />
      <s-tooltip :content="t('addressBook.selectContact')" border-radius="mini" placement="top" tabindex="-1">
        <s-icon class="book-icon-open" name="basic-user-24" size="18" @click.native="openAddressBook" />
      </s-tooltip>
    </wallet-account>

    <s-input
      v-else
      v-model="address"
      v-bind="{
        maxlength: 128,
        placeholder: t('addressBook.input'),
        borderRadius: 'medium',
        ...$attrs,
      }"
    >
      <template #right>
        <s-icon v-if="address" class="book-icon-unlink" name="el-icon-close" size="20" @click.native="resetAddress" />
        <s-tooltip :content="t('addressBook.selectContact')" border-radius="mini" placement="top" tabindex="-1">
          <s-icon class="book-icon-open" name="basic-user-24" size="18" @click.native="openAddressBook" />
        </s-tooltip>
      </template>
    </s-input>

    <div v-if="isNewAddress" class="new-address">
      <span class="new-address-msg">{{ t('addressBook.detected') }}</span>
      <span class="new-address-save" @click="openContact(address)">{{ t('addressBook.save') }}</span>
    </div>

    <address-book-list
      :visible.sync="showAddressBookDialog"
      :accounts="accountsRecords"
      :records="bookRecords"
      :excluded-address="excludedAddress"
      @open="openContact"
      @select="chooseRecord"
      @remove="removeAddressFromBook"
    />
    <address-book-contact
      :accounts="accountsRecords"
      :book="addressBook"
      :prefilled-address="prefilledAddress"
      :is-edit-mode="isEditMode"
      :visible.sync="showSetContactDialog"
      @add="setAddressToBook"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, ModelSync, Prop, Watch } from 'vue-property-decorator';

import { api } from '../../api';
import { mutation, state } from '../../store/decorators';
import { formatSoraAddress, subscribeToWalletAccounts } from '../../util';
import WalletAccount from '../Account/WalletAccount.vue';
import SearchInput from '../Input/SearchInput.vue';
import TranslationMixin from '../mixins/TranslationMixin';

import AddressBookContact from './Contact.vue';
import AddressBookList from './List.vue';

import type { AppWallet } from '../../consts';
import type { Book, PolkadotJsAccount } from '../../types/common';

@Component({
  inheritAttrs: false,
  components: {
    SearchInput,
    WalletAccount,
    AddressBookList,
    AddressBookContact,
  },
})
export default class AddressBookInput extends Mixins(TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly excludeConnected!: boolean;
  @Prop({ default: '', type: String }) readonly value!: string;
  @Prop({ default: false, type: Boolean }) readonly isValid!: boolean;

  @Watch('books')
  @Watch('isValid')
  private updateName(): void {
    if (!this.isValid) {
      this.name = '';
    } else if (!this.name) {
      const key = formatSoraAddress(this.address);
      this.name = this.books[key] || '';
    }
  }

  get address(): string {
    return this.value;
  }

  set address(value: string) {
    const prepared = value.trim();

    this.$emit('input', prepared);
  }

  name = '';
  prefilledAddress = '';

  @state.account.address private connected!: string;
  @state.account.source private source!: AppWallet;
  @state.account.book addressBook!: Book;

  @mutation.account.setAddressToBook setAddressToBook!: (record: PolkadotJsAccount) => void;
  @mutation.account.removeAddressFromBook removeAddressFromBook!: (address: string) => void;

  showAddressBookDialog = false;
  showSetContactDialog = false;

  isEditMode = false;

  accountsSubscription: Nullable<any> = null;
  accountsRecords: PolkadotJsAccount[] = [];

  get accountBook(): Book {
    return this.accountsRecords.reduce((book, { address, name }) => {
      const key = formatSoraAddress(address);

      return {
        ...book,
        [key]: name,
      };
    }, {});
  }

  get books(): Book {
    return { ...this.accountBook, ...this.addressBook };
  }

  get bookRecords(): PolkadotJsAccount[] {
    return Object.entries(this.addressBook).map(([address, name]) => ({ address, name }));
  }

  get isNewAddress(): boolean {
    if (!this.address) return false;

    try {
      const formattedAddress = formatSoraAddress(this.address);
      const found = this.accountsRecords.find((account) => formatSoraAddress(account.address) === formattedAddress);

      return !this.addressBook[formattedAddress] && !found;
    } catch {
      return false;
    }
  }

  get excludedAddress(): string {
    return this.excludeConnected ? this.connected : '';
  }

  get record(): Nullable<PolkadotJsAccount> {
    const { address, name, isValid } = this;

    return isValid && name ? { address, name } : null;
  }

  openAddressBook(): void {
    this.showAddressBookDialog = true;
  }

  chooseRecord({ name, address }: PolkadotJsAccount): void {
    this.address = address;
    this.name = name;
  }

  openContact(address: Nullable<string>, isEditMode = false): void {
    this.isEditMode = isEditMode;
    this.prefilledAddress = address ? formatSoraAddress(address) : '';
    this.showSetContactDialog = true;
  }

  resetAddress(): void {
    this.address = '';
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
