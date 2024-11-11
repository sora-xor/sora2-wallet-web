<template>
  <dialog-base :title="title" :visible.sync="isVisible" :tooltip="tooltip" append-to-body>
    <div class="set-address">
      <s-input
        ref="address"
        class="set-address__input"
        :placeholder="t('nameText')"
        v-model="name"
        :disabled="loading"
        :maxlength="30"
      />
      <s-input
        class="set-address__input"
        :placeholder="t('addressText')"
        v-model="address"
        :disabled="inputDisabled"
        @input="defineIdentity"
      />
      <template v-if="validAddress && isNotSoraAddress">
        <p class="wallet-send-address-warning">{{ t('addressBook.notSoraAddress') }}</p>
        <s-tooltip :content="copyValueAssetId" placement="top">
          <p class="wallet-send-address-formatted" @click="handleCopyAddress(formattedSoraAddress, $event)">
            {{ formattedSoraAddress }}
          </p>
        </s-tooltip>
      </template>
      <s-input class="set-address__input" :placeholder="t('addressBook.identity')" v-model="onChainIdentity" disabled />
      <div class="set-address__btn">
        <s-button @click="setContact" type="primary" class="s-typography-button--large" :disabled="btnDisabled">
          {{ btnText }}
        </s-button>
      </div>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import debounce from 'lodash/fp/debounce';
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator';

import { validateAddress, formatAccountAddress, getAccountIdentity } from '../../util';
import DialogBase from '../DialogBase.vue';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import DialogMixin from '../mixins/DialogMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import TranslationMixin from '../mixins/TranslationMixin';

import type { Book, PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
  },
})
export default class AddressBookContact extends Mixins(DialogMixin, TranslationMixin, LoadingMixin, CopyAddressMixin) {
  @Prop({ default: () => ({}), type: Object }) readonly book!: Book;
  @Prop({ default: () => [], type: Array }) readonly accounts!: PolkadotJsAccount[];
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
      this.name = this.book[this.prefilledAddress] ?? '';
    }

    await this.$nextTick();
    this.addressInput.focus();
  }

  address = '';
  name = '';
  onChainIdentity = this.t('addressBook.none');

  defineIdentity = debounce(500)(this.getIdentity);

  setContact(): void {
    const record = { address: this.formattedSoraAddress, name: this.formattedName };
    this.$emit('add', record);
    this.closeDialog();
  }

  async getIdentity(address: string): Promise<void> {
    const identity = await getAccountIdentity(address, this.t('addressBook.none'));
    this.onChainIdentity = identity.name;
  }

  get title(): string {
    return this.isEditMode ? this.t('addressBook.options.edit') : this.t('addressBook.addContact');
  }

  get tooltip(): string {
    return this.t('addressBook.tooltip');
  }

  get copyValueAssetId(): string {
    return this.copyTooltip(this.t('assets.assetId'));
  }

  get btnText(): string {
    if (!this.formattedName) return this.t('addressBook.btn.enterName');
    if (!this.validAddress) {
      return this.t(`walletSend.${this.emptyAddress ? 'enterAddress' : 'badAddress'}`);
    }
    if (this.isAddressPresented) return this.t('addressBook.btn.present');
    return this.isEditMode ? this.t('addressBook.btn.saveChanges') : this.t('saveText');
  }

  get btnDisabled(): boolean {
    return !this.validAddress || !this.formattedName || this.isAddressPresented;
  }

  get inputDisabled(): boolean {
    return this.isEditMode;
  }

  get isNotSoraAddress(): boolean {
    return !!this.formattedSoraAddress && this.address.slice(0, 2) !== 'cn';
  }

  get isAddressAdded(): boolean {
    const found = this.accounts.find((account) => formatAccountAddress(account.address) === this.formattedSoraAddress);
    return !!this.book[this.address] || Boolean(found);
  }

  get isAddressPresented(): boolean {
    return this.isAddressAdded && !this.isEditMode;
  }

  get emptyAddress(): boolean {
    return !this.address.trim();
  }

  get formattedName(): string {
    return this.name.trim();
  }

  get formattedSoraAddress(): string {
    return formatAccountAddress(this.address);
  }

  get validAddress(): boolean {
    return validateAddress(this.address);
  }
}
</script>

<style lang="scss" scoped>
.wallet-send {
  &-address-warning {
    color: var(--s-color-status-warning);
    margin-bottom: var(--s-basic-spacing);
    font-weight: 400;
    font-size: var(--s-font-size-extra-small);
    line-height: var(--s-line-height-base);
    padding-right: calc(var(--s-basic-spacing) * 2);
    padding-left: calc(var(--s-basic-spacing) * 2);
  }

  &-address-formatted {
    margin: 0 auto;
    margin-bottom: calc(var(--s-basic-spacing));
    font-weight: 200;
    font-size: var(--s-font-size-mini);
    line-height: var(--s-line-height-base);
    letter-spacing: var(--s-letter-spacing-small);
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

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
