<template>
  <div class="save-password">
    <label class="save-password-option">
      <s-switch v-model="model" />
      <div :class="['save-password-option-description', { hint }]">
        <span class="save-password-option-title">{{ t('signatureSettings.signature.title') }}</span>
        <span v-if="hint" class="save-password-option-hint">{{ t('signatureSettings.hint') }}</span>
      </div>
    </label>
    <slot />
    <div v-if="model" class="save-password-duration">
      <template v-if="passwordResetDate">
        <div class="save-password-duration-saved">
          <span class="save-password-duration-title">{{ t('signatureSettings.disabled') }}:</span>
          <span> {{ passwordResetDate }}</span>
        </div>
      </template>
      <template v-else>
        <span class="save-password-duration-title">{{ t('signatureSettings.disable') }}:</span>
        <s-tabs v-model="passwordTimeoutModel" type="rounded" class="save-password-durations">
          <s-tab v-for="duration in durations" :key="duration" :label="duration" :name="duration" />
        </s-tabs>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { PassphraseTimeout, PassphraseTimeoutDuration, DefaultPassphraseTimeout } from '../../consts';
import { action, getter, mutation, state } from '../../store/decorators';
import TranslationMixin from '../mixins/TranslationMixin';

@Component
export default class AccountPasswordTimeout extends Mixins(TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly hint!: boolean;

  @state.transactions.isSignTxDialogEnabled private isSignTxDialogEnabled!: boolean;
  @mutation.transactions.setSignTxDialogEnabled private setSignTxDialogEnabled!: (flag: boolean) => void;

  @getter.account.passwordTimeoutKey private passwordTimeoutKey!: PassphraseTimeout;
  @mutation.account.setPasswordTimeout private setPasswordTimeout!: (timeout: number) => void;

  @state.account.passwordTimeout private passwordTimeout!: number;
  @state.account.accountPasswordTimestamp private accountPasswordTimestamp!: Nullable<number>;
  @action.account.resetAccountPassphrase private resetAccountPassphrase!: FnWithoutArgs;

  readonly durations = PassphraseTimeout;

  get model(): boolean {
    return !this.isSignTxDialogEnabled;
  }

  set model(value: boolean) {
    this.setSignTxDialogEnabled(!value);

    if (!value) {
      this.resetAccountPassphrase();
    }
  }

  get passwordTimeoutModel(): PassphraseTimeout {
    return this.passwordTimeoutKey;
  }

  set passwordTimeoutModel(name: PassphraseTimeout) {
    const duration = PassphraseTimeoutDuration[name] ?? DefaultPassphraseTimeout;
    this.setPasswordTimeout(duration);
  }

  get passwordResetDate(): Nullable<string> {
    if (!this.accountPasswordTimestamp) return null;

    const timestamp = this.accountPasswordTimestamp + this.passwordTimeout;

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
  }
}
</style>

<style lang="scss" scoped>
.save-password {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-medium;
}

.save-password-option {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: $basic-spacing-medium;
  cursor: pointer;

  &-description {
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    font-size: var(--s-font-size-medium);
    font-weight: 300;

    &.hint {
      font-size: var(--s-font-size-small);
    }
  }
  &-title {
    color: var(--s-color-base-content-primary);
  }
  &-hint {
    color: var(--s-color-base-content-secondary);
    font-size: var(--s-font-size-extra-small);
  }
}

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
