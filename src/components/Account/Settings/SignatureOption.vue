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
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { PassphraseTimeout, PassphraseTimeoutDuration, DefaultPassphraseTimeout } from '../../../consts';
import { action, mutation, state } from '../../../store/decorators';
import TranslationMixin from '../../mixins/TranslationMixin';

import AccountSettingsOption from './Option.vue';

dayjs.extend(relativeTime);

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

  @state.account.accountPasswordTimeout private accountPasswordTimeout!: number;
  @mutation.account.setPasswordTimeout private setPasswordTimeout!: (timeout: number) => void;

  @state.account.address private connected!: string;
  @state.account.accountPasswordTimestamp private accountPasswordTimestamp!: Record<string, Nullable<number>>;
  @action.account.resetAccountPassphrase private resetAccountPassphrase!: (address: string) => void;

  readonly durations = PassphraseTimeout;

  get model(): boolean {
    return this.isSignTxDialogDisabled;
  }

  set model(value: boolean) {
    this.setSignTxDialogDisabled(value);

    if (!value) {
      this.resetAccountPassphrase(this.connected);
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

  private timestamp: Nullable<number> = null;
  private timer: Nullable<NodeJS.Timeout> = null;

  created(): void {
    this.createTimer();
  }

  destroyed(): void {
    this.resetTimer();
  }

  private updateTimestamp(): void {
    this.timestamp = Date.now();
  }

  private createTimer(): void {
    this.resetTimer();
    this.updateTimestamp();
    this.timer = setInterval(this.updateTimestamp, 1000);
  }

  private resetTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = null;
    this.timestamp = null;
  }

  get passwordResetDate(): Nullable<string> {
    const accountPasswordTimestamp = this.accountPasswordTimestamp[this.connected];

    if (!(accountPasswordTimestamp && this.timestamp)) return null;

    const diff = accountPasswordTimestamp + this.accountPasswordTimeout - this.timestamp;

    return dayjs.duration(diff).locale(this.dayjsLocale).humanize();
  }
}
</script>

<style lang="scss">
$telegram-web-app-width: 500px;

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

  // override s-tabs arrows
  .el-icon-arrow-left,
  .el-icon-arrow-right {
    display: block;
    margin-top: 10px;
  }

  &.s-tabs.s-rounded .el-tabs__header {
    @media screen and (max-width: $telegram-web-app-width) {
      display: flex;
      justify-content: center;
      align-items: center;
      width: auto;

      .el-tabs__nav-wrap .el-tabs__item.is-active {
        box-shadow: 0 0 2px 1px var(--s-shadow-color-dark);
      }
    }
  }

  .el-tabs__nav-scroll {
    @media screen and (max-width: $telegram-web-app-width) {
      width: 260px;
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
    align-items: baseline;
    gap: $basic-spacing;
  }
}
</style>
