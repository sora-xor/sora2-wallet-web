<template>
  <dialog-base :title="t('account.rename')" :visible.sync="isVisible" class="account-rename-dialog">
    <s-form class="account-rename-dialog__form" @submit.native.prevent="handleConfirm">
      <wallet-account :polkadot-account="account" />
      <s-input
        type="text"
        :placeholder="t('desktop.accountName.placeholder')"
        :minlength="MINLENGTH"
        :disabled="loading"
        v-model="value"
      />
      <s-button
        type="primary"
        native-type="submit"
        class="account-rename-dialog__button"
        :disabled="!valid"
        :loading="loading"
      >
        {{ t('confirmText') }}
      </s-button>
    </s-form>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import { ObjectInit } from '../../consts';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

import WalletAccount from './WalletAccount.vue';

import type { PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
    WalletAccount,
  },
})
export default class AccountRenameDialog extends Mixins(DialogMixin, TranslationMixin) {
  @Prop({ default: ObjectInit, type: Object }) readonly account!: PolkadotJsAccount;
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;

  @Watch('isVisible')
  private setupFormState(visibility: boolean): void {
    if (!visibility) {
      this.value = '';
    }
  }

  readonly MINLENGTH = 3;

  value = '';

  get prepared(): string {
    return this.value.trim();
  }

  get valid(): boolean {
    return this.prepared.length >= this.MINLENGTH;
  }

  async handleConfirm(): Promise<void> {
    this.$emit('confirm', this.prepared);
  }
}
</script>

<style lang="scss" scoped>
.account-rename-dialog {
  &__form {
    display: flex;
    flex-flow: column nowrap;
    gap: $basic-spacing-medium;
  }

  &__button {
    width: 100%;
  }
}
</style>
