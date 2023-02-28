<template>
  <div class="login">
    <div class="login__title">{{ title }}</div>
    <div class="login__step-count">Step {{ stepNumber }} / 3</div>
    <template v-if="step === LoginStep.SeedPhrase">
      <div class="seed-grid s-flex">
        <div v-for="column in 3" :key="column" class="seed-grid__column">
          <div v-for="(word, idx) in seedPhraseWords" :key="`${word}${idx}`">
            <div v-if="renderWord(column, idx)" class="seed-grid__word">
              <span class="seed-grid__word-number">{{ idx + 1 }}</span>
              <span>{{ word }}</span>
            </div>
          </div>
        </div>
      </div>
      <s-button @click="handleCopy" class="login__copy-seed">
        <span>Copy phrase</span>
        <s-icon name="basic-copy-24" size="18"></s-icon>
      </s-button>
      <div class="login__text-advice">
        <p>
          {{ t('desktop.seedAdviceText') }}
        </p>
      </div>
      <s-button key="step1" @click="nextStep" class="s-typography-button--large login-btn" type="primary">{{
        t('desktop.button.next')
      }}</s-button>
    </template>
    <template v-if="step === LoginStep.ConfirmSeedPhrase">
      <div class="login__random-order login__order-container">
        <div
          v-for="(word, idx) in randomizedSeedPhraseMap"
          :key="idx"
          :class="['login__random-word', { hidden: isHiddenWord(idx), incorrect }]"
          @click="chooseWord(idx)"
        >
          <s-button size="small">
            {{ word }}
          </s-button>
        </div>
      </div>
      <div class="login__text-confirm">
        <p>
          {{ t('desktop.confirmSeedText') }}
        </p>
      </div>
      <div class="delimiter"></div>
      <div class="login__correct-order login__order-container">
        <div v-for="idx in seedPhraseToCompareIdx" :key="idx" class="login__random-word" @click="discardWord(idx)">
          <s-button size="small">
            {{ randomizedSeedPhraseMap[idx] }}
          </s-button>
        </div>
      </div>
      <div class="login__error">
        <transition name="fade">
          <span v-if="showErrorMessage" class="login__error-text">{{ t('desktop.errorMnemonicText') }}</span>
        </transition>
      </div>
      <s-button
        key="step2"
        @click="handleMnemonicCheck"
        class="s-typography-button--large login-btn"
        :type="btnTypeConfirmStep"
      >
        {{ btnTextConfirmStep }}
      </s-button>
    </template>
    <template v-else-if="step === LoginStep.CreateCredentials">
      <div class="login__inputs">
        <s-form>
          <s-input
            :placeholder="t('desktop.accountName.placeholder')"
            v-model="accountName"
            :disabled="loading"
          ></s-input>
          <p class="login__create-account-desc">{{ t('desktop.accountName.desc') }}</p>
          <s-input
            :type="inputType"
            :placeholder="t('desktop.password.placeholder')"
            v-model="accountPassword"
            :disabled="loading"
          >
            <s-icon
              :name="iconPasswordStyle"
              size="18"
              class="eye-icon"
              slot="suffix"
              @click.native="toggleVisibility"
            />
          </s-input>
          <p class="login__create-account-desc">{{ t('desktop.password.desc') }}</p>
          <s-input
            type="password"
            :placeholder="t('desktop.confirmPassword.placeholder')"
            v-model="accountPasswordConfirm"
            :disabled="loading"
          ></s-input>
        </s-form>
      </div>
      <div class="wallet-settings-create-token_export">
        <s-switch v-model="toExport" :disabled="loading" />
        <span>{{ t('desktop.exportOptionText') }}</span>
      </div>
      <p class="wallet-settings-create-token_desc">{{ t('desktop.exportJsonText') }}</p>
      <s-button
        key="step3"
        class="s-typography-button--large login-btn"
        type="primary"
        :disabled="isInputsNotFilled"
        :loading="loading"
        @click="handleAccountCreate"
      >
        {{ t('desktop.button.createAccount') }}
      </s-button>
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import isEqual from 'lodash/fp/isEqual';
import type { CreateResult } from '@polkadot/ui-keyring/types';

import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';
import { api } from '../../../api';
import { LoginStep } from '../../../consts';
import { copyToClipboard, delay } from '../../../util';
import { action } from '../../../store/decorators';

@Component
export default class CreateAccount extends Mixins(NotificationMixin, LoadingMixin) {
  @Prop({ type: String, required: true }) readonly step!: LoginStep;

  @action.account.createAccount private createAccount!: (data: {
    seed: string;
    name: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<CreateResult>;

  @action.account.exportAccount private exportAccount!: (data: {
    account?: CreateResult;
    password: string;
  }) => Promise<void>;

  readonly LoginStep = LoginStep;
  readonly PHRASE_LENGTH = 12;

  accountName = '';
  accountPassword = '';
  accountPasswordConfirm = '';

  seedPhraseToCompareIdx: Array<number> = [];

  showErrorMessage = false;
  hiddenInput = true;
  toExport = false;
  incorrect = false;

  get title(): string {
    if (this.step === LoginStep.SeedPhrase) return this.t('desktop.heading.seedPhraseTitle');
    if (this.step === LoginStep.ConfirmSeedPhrase) return this.t('desktop.heading.confirmSeedTitle');
    if (this.step === LoginStep.CreateCredentials) return this.t('desktop.heading.accountDetailsTitle');
    return '';
  }

  get stepNumber(): number {
    switch (this.step) {
      case LoginStep.SeedPhrase:
        return 1;
      case LoginStep.ConfirmSeedPhrase:
        return 2;
      case LoginStep.CreateCredentials:
        return 3;
      default:
        return 1;
    }
  }

  get btnTextConfirmStep(): string {
    if (this.seedPhraseToCompare.length === this.PHRASE_LENGTH) {
      return this.t('desktop.button.next');
    }
    return this.t('desktop.button.skip');
  }

  get inputType(): string {
    return this.hiddenInput ? 'password' : 'text';
  }

  get iconPasswordStyle(): string {
    return this.hiddenInput ? 'basic-eye-no-24' : 'basic-filterlist-24';
  }

  get btnTypeConfirmStep(): string {
    if (this.seedPhraseToCompare.length === this.PHRASE_LENGTH) {
      return 'primary';
    }
    return 'secondary';
  }

  get isInputsNotFilled(): boolean {
    return !this.accountName || !this.accountPassword || !this.accountPasswordConfirm;
  }

  get seedPhrase(): string {
    const { seed } = api.createSeed();
    return seed;
  }

  get seedPhraseWords(): Array<string> {
    return this.seedPhrase.split(' ').map((word) => word.toUpperCase());
  }

  get randomizedSeedPhraseMap(): Record<number, string> {
    return [...this.seedPhraseWords]
      .sort(() => Math.random() - 0.5)
      .reduce((acc, word, index) => ({ ...acc, [index]: word }), {});
  }

  get seedPhraseToCompare(): Array<string> {
    return this.seedPhraseToCompareIdx.map((idx) => this.randomizedSeedPhraseMap[idx]);
  }

  isHiddenWord(wordIndex: number) {
    return this.seedPhraseToCompareIdx.includes(wordIndex);
  }

  toggleVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
  }

  chooseWord(index: number): void {
    if (!this.seedPhraseToCompareIdx.includes(index)) {
      this.seedPhraseToCompareIdx.push(index);
    }
  }

  discardWord(index: number): void {
    this.seedPhraseToCompareIdx = this.seedPhraseToCompareIdx.filter((idx) => idx !== index);
  }

  async handleCopy(): Promise<void> {
    await copyToClipboard(this.seedPhrase);
  }

  renderWord(column: number, index: number): boolean {
    return Math.floor(index / 4) === column - 1;
  }

  nextStep(): void {
    this.$emit('update:step', LoginStep.ConfirmSeedPhrase);
  }

  handleMnemonicCheck(): void {
    if (this.seedPhraseToCompare.length < this.PHRASE_LENGTH) {
      this.$emit('update:step', LoginStep.CreateCredentials);
      return;
    }
    const isSeedPhraseMatched = isEqual(this.seedPhraseToCompare, this.seedPhrase);
    if (!isSeedPhraseMatched) {
      this.seedPhraseToCompareIdx = [];
      this.runErrorMessage();
      this.runReturnAnimation();
    } else {
      this.$emit('update:step', LoginStep.CreateCredentials);
    }
  }

  runErrorMessage(): void {
    this.showErrorMessage = true;

    setTimeout(() => {
      this.showErrorMessage = false;
    }, 4500);
  }

  runReturnAnimation(): void {
    this.incorrect = true;

    setTimeout(() => {
      this.incorrect = false;
    }, 2000);
  }

  private async createNewAccount(): Promise<void> {
    const account = await this.createAccount({
      seed: this.seedPhrase,
      name: this.accountName,
      password: this.accountPassword,
      passwordConfirm: this.accountPasswordConfirm,
    });

    if (this.toExport) {
      await this.exportAccount({ account, password: this.accountPassword });
    }

    this.$emit('update:step', LoginStep.AccountList);
  }

  async handleAccountCreate(): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution
      await delay(500);
      await this.withAppNotification(this.createNewAccount);
    });
  }

  beforeUpdate() {
    if (this.step !== LoginStep.ConfirmSeedPhrase) {
      this.seedPhraseToCompareIdx = [];
    }
  }
}
</script>

<style lang="scss">
.seed-grid {
  &__word {
    margin: 10px 20px;

    &-number {
      margin-right: 8px;
      color: var(--s-color-base-content-secondary);
    }
  }

  &__column {
    display: inline-block;
  }
}
.login {
  &__title {
    margin-top: -54px;
  }

  &__text-advice {
    text-align: center;
    margin-bottom: 8px;
    font-weight: 300;
  }

  &__text-confirm {
    width: 300px;
    text-align: center;
    font-weight: 300;
  }

  &__error {
    height: 20px;
    margin-bottom: 6px;
    &-text {
      color: var(--s-color-status-error);
    }
  }

  &__copy-seed {
    margin: 8px 0 28px 0 !important;
    height: 28px !important;
    font-size: calc(var(--s-size-mini) / 2) !important;

    .s-icon-basic-copy-24 {
      margin-left: 6px;
    }
  }

  &__order-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px 8px;
    min-height: 74px;
  }

  &__random-order {
    margin: 0px auto calc(var(--s-size-small) / 2) auto;
  }

  &__correct-order {
    margin: var(--s-size-mini) auto;
  }

  &__random-word {
    button {
      background-color: #f4f0f1 !important;
      color: #000 !important;
    }

    span {
      font-weight: 400 !important;
    }

    &.hidden {
      visibility: hidden;
    }

    &.incorrect {
      @include shake;
    }
  }

  &__inputs {
    width: 100%;
    margin-bottom: calc(var(--s-size-small) / 2);
  }

  &__step-count {
    margin: 6px 0 16px 0;
  }

  &__create-account-desc {
    color: var(--s-color-base-content-primary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    padding: var(--s-basic-spacing) #{$basic-spacing-small} #{$basic-spacing-medium};
    width: 330px !important;
  }

  .eye-icon {
    color: var(--s-color-base-content-tertiary);
    &:hover {
      cursor: pointer;
    }
  }

  .delimiter {
    margin: calc(var(--s-size-small) / 2) 0 var(--s-size-mini) 0;
    width: 100%;
    height: 1px;
    background-color: var(--s-color-base-content-tertiary);
  }
}
</style>

<style lang="scss" scoped>
@include login-view;

.wallet-settings-create-token {
  &_desc {
    color: var(--s-color-base-content-primary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    padding: var(--s-basic-spacing) #{$basic-spacing-small} #{$basic-spacing-medium};
  }

  &_export {
    @include switch-block;
    align-self: start;
    padding: 0 #{$basic-spacing-small};
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
