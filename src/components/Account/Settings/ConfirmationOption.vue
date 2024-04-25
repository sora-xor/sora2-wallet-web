<template>
  <account-settings-option
    :title="t('accountSettings.confirmation.title')"
    :hint="t('accountSettings.hint')"
    :with-hint="withHint"
    v-model="model"
  >
    <slot />
  </account-settings-option>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { mutation, state } from '../../../store/decorators';
import TranslationMixin from '../../mixins/TranslationMixin';

import AccountSettingsOption from './Option.vue';

@Component({
  components: {
    AccountSettingsOption,
  },
})
export default class AccountConfirmationOption extends Mixins(TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly withHint!: boolean;

  @state.transactions.isConfirmTxDialogEnabled private isConfirmTxDialogEnabled!: boolean;
  @mutation.transactions.setConfirmTxDialogEnabled private setConfirmTxDialogEnabled!: (flag: boolean) => void;

  get model(): boolean {
    return this.isConfirmTxDialogEnabled;
  }

  set model(value: boolean) {
    this.setConfirmTxDialogEnabled(value);
  }
}
</script>
