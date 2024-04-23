<template>
  <div class="save-password">
    <label class="save-password-option">
      <s-switch v-model="savePasswordModel" />
      <span>{{ t('desktop.dialog.savePasswordText') }} ({{ left }} left)</span>
    </label>
    <s-tabs v-model="passwordTimeoutModel" type="rounded" class="save-password-duration">
      <s-tab v-for="duration in durations" :key="duration" :label="duration" :name="duration" />
    </s-tabs>
  </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Component, Mixins } from 'vue-property-decorator';

import { PassphraseTimeout, PassphraseTimeoutDuration, DefaultPassphraseTimeout } from '../../consts';
import { action, getter, mutation, state } from '../../store/decorators';
import TranslationMixin from '../mixins/TranslationMixin';

dayjs.extend(duration);
dayjs.extend(relativeTime);

@Component
export default class AccountPasswordTimeout extends Mixins(TranslationMixin) {
  @state.account.savePassword private savePassword!: boolean;
  @state.account.passwordTimeout private passwordTimeout!: number;
  @state.account.accountPasswordTimestamp private accountPasswordTimestamp!: Nullable<number>;
  @action.account.setAccountPasswordSave private setAccountPasswordSave!: (flag: boolean) => void;

  @getter.account.passwordTimeoutKey private passwordTimeoutKey!: PassphraseTimeout;
  @mutation.account.setPasswordTimeout private setPasswordTimeout!: (timeout: number) => void;

  readonly durations = PassphraseTimeout;

  private timer: Nullable<NodeJS.Timer> = null;
  private time: Nullable<number> = null;

  created(): void {
    this.createTimer();
  }

  private createTimer(): void {
    this.clearTimer();
    this.timer = setInterval(() => {
      this.time = Date.now();
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = null;
    this.time = null;
  }

  get passwordSecondsLeft(): number {
    if (!(this.time && this.accountPasswordTimestamp)) return 0;

    const end = this.passwordTimeout + this.accountPasswordTimestamp;
    const left = Math.floor((end - this.time) / 1000);

    return Math.max(left, 0);
  }

  get left(): string {
    if (!this.passwordSecondsLeft) return '';

    return dayjs.duration(this.passwordSecondsLeft, 'seconds').humanize();
  }

  get savePasswordModel(): boolean {
    return this.savePassword;
  }

  set savePasswordModel(flag: boolean) {
    this.setAccountPasswordSave(flag);
  }

  get passwordTimeoutModel(): PassphraseTimeout {
    return this.passwordTimeoutKey;
  }

  set passwordTimeoutModel(name: PassphraseTimeout) {
    const duration = PassphraseTimeoutDuration[name] ?? DefaultPassphraseTimeout;
    this.setPasswordTimeout(duration);
  }
}
</script>

<style lang="scss">
.password-timeouts {
  .el-tabs__header {
    margin-bottom: 0;
  }

  &.s-tabs.s-rounded .el-tabs__nav-wrap .el-tabs__item {
    text-transform: initial;
    padding: 0 $basic-spacing-big;
  }
}
</style>

<style lang="scss" scoped>
.save-password {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing;

  &-option {
    @include switch-block;
    padding: 0;
  }
}
</style>
