<template>
  <account-settings-option
    :disabled="disabled"
    :title="t('accountSettings.signature.title')"
    :hint="t('accountSettings.hint')"
    :with-hint="withHint"
    v-model="model"
  >
    <slot />
    <div v-if="disabled || model" class="save-password-duration">
      <template v-if="passwordResetDate">
        <div class="save-password-duration-saved">
          <span class="save-password-duration-title">{{ t('accountSettings.disabled') }}:</span>
          <span> {{ passwordResetDate }}</span>
        </div>
      </template>
      <template v-else>
        <span class="save-password-duration-title">{{ t('accountSettings.disable') }}:</span>
        <s-tabs v-model="passwordTimeoutModel" type="rounded" class="save-password-durations">
          <s-tab
            v-for="duration in durations"
            :key="duration"
            :label="duration"
            :name="duration"
            :disabled="disabled"
          />
        </s-tabs>
      </template>
    </div>
  </account-settings-option>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { PassphraseTimeout, PassphraseTimeoutDuration, DefaultPassphraseTimeout } from '../../../consts';
import { action, getter, mutation, state } from '../../../store/decorators';
import TranslationMixin from '../../mixins/TranslationMixin';

import AccountSettingsOption from './Option.vue';

@Component({
  components: {
    AccountSettingsOption,
  },
})
export default class AccountSignatureOption extends Mixins(TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly withHint!: boolean;
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean;

  @state.transactions.isSignTxDialogDisabled private isSignTxDialogDisabled!: boolean;
  @mutation.transactions.setSignTxDialogDisabled private setSignTxDialogDisabled!: (flag: boolean) => void;

  @mutation.account.setPasswordTimeout private setPasswordTimeout!: (timeout: number) => void;

  @state.account.accountPasswordTimeout private accountPasswordTimeout!: number;
  @state.account.accountPasswordTimestamp private accountPasswordTimestamp!: Nullable<number>;
  @action.account.resetAccountPassphrase private resetAccountPassphrase!: FnWithoutArgs;

  readonly durations = PassphraseTimeout;

  get model(): boolean {
    return this.isSignTxDialogDisabled;
  }

  set model(value: boolean) {
    this.setSignTxDialogDisabled(value);

    if (!value) {
      this.resetAccountPassphrase();
    }
  }

  get passwordTimeoutModel(): PassphraseTimeout {
    const key = Object.keys(PassphraseTimeoutDuration).find(
      (key) => PassphraseTimeoutDuration[key] === this.accountPasswordTimeout
    );

    if (!key) return PassphraseTimeout.FIFTEEN_MINUTES;

    return key as PassphraseTimeout;
  }

  set passwordTimeoutModel(name: PassphraseTimeout) {
    const duration = PassphraseTimeoutDuration[name] ?? DefaultPassphraseTimeout;
    this.setPasswordTimeout(duration);
  }

  get passwordResetDate(): Nullable<string> {
    if (!this.accountPasswordTimestamp) return null;

    const timestamp = this.accountPasswordTimestamp + this.accountPasswordTimeout;

    return this.formatDate(timestamp);
  }
}
</script>

<style lang="scss">
.save-password-durations {
  .el-tabs__header {
    margin-bottom: 0;
  }

  &.s-tabs.s-rounded .el-tabs__nav-wrap .el-tabs__item {
    text-transform: initial;

    &.is-disabled {
      cursor: not-allowed;
    }
  }
}
</style>

<style lang="scss" scoped>
.save-password-duration {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-small;

  &-title {
    font-size: var(--s-font-size-extra-small);
    font-weight: 700;
    text-transform: uppercase;
  }

  &-saved {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: $basic-spacing;
  }
}
</style>
