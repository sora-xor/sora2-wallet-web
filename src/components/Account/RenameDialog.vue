<template>
  <dialog-base title="Rename account" :visible.sync="isVisible">
    <div class="account-rename-dialog">
      <wallet-account />
      <s-input
        type="text"
        :placeholder="t('desktop.accountName.placeholder')"
        :minlength="MINLENGTH"
        :disabled="loading"
        v-model="value"
      />
      <s-button
        type="primary"
        class="account-rename-dialog__button"
        :disabled="!valid"
        :loading="loading"
        @click="handleConfirm"
      >
        Confirm
      </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import DialogBase from '../DialogBase.vue';
import WalletAccount from './WalletAccount.vue';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

@Component({
  components: {
    DialogBase,
    WalletAccount,
  },
})
export default class RenameAccountDialog extends Mixins(DialogMixin, TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;

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
    this.value = '';
  }
}
</script>

<style lang="scss" scoped>
.account-rename-dialog {
  & > * {
    margin-bottom: $basic-spacing-medium;
  }

  &__button {
    width: 100%;
  }
}
</style>
