<template>
  <div>
    <div class="login__title">{{ title }}</div>
    <div class="login__step-count">Step {{ stepNumber }} / 3</div>
    <template v-if="step === LoginStep.SeedPhrase">
      <div class="seed-grid">
        <div v-for="column in 3" :key="column" class="seed-grid__column">
          <div v-for="(word, idx) in seedPhraseAsArray" :key="word">
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
      <div class="login__random-order">
        <div
          @click="chooseWord"
          v-for="(word, idx) in randomizedSeedPhrase"
          :key="getKey(word, idx)"
          :ref="'word' + Number(idx + 1)"
          :class="'word' + Number(idx + 1)"
          class="login__random-word"
        >
          <s-button>
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
      <div class="login__correct-order">
        <div
          v-for="(word, idx) in seedPhraseToCompare"
          @click="discardWord"
          :key="'text' + Number(idx + 1)"
          class="login__random-word"
        >
          <s-button>
            {{ word }}
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
      <a ref="json" class="download-json" />
      <s-button
        key="step3"
        @click="createAccount"
        class="s-typography-button--large login-btn"
        type="primary"
        :disabled="isInputsNotFilled"
      >
        {{ t('desktop.button.createAccount') }}
      </s-button>
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Ref } from 'vue-property-decorator';
import isEqual from 'lodash/fp/isEqual';

import LoadingMixin from '../../../components/mixins/LoadingMixin';
import TranslationMixin from '../../../components/mixins/TranslationMixin';
import { api } from '../../../api';
import { LoginStep } from '../../../consts';
import { copyToClipboard } from '../../../util';
import { action } from '../../../store/decorators';

@Component
export default class CreateAccount extends Mixins(TranslationMixin, LoadingMixin) {
  @action.account.getPolkadotJsAccounts getPolkadotJsAccounts!: () => Promise<void>;

  @Prop({ type: String, required: true }) readonly step!: LoginStep;
  @Ref('json') readonly json!: HTMLLinkElement;

  readonly LoginStep = LoginStep;
  readonly PHRASE_LENGTH = 12;

  accountName = '';
  accountPassword = '';
  accountPasswordConfirm = '';
  fileName = '';
  href: string | null = null;

  seedPhraseToCompare: Array<string | undefined> = [];
  seedPhraseBoundToClass = new Map<string | undefined, string>();

  showErrorMessage = false;
  hiddenInput = true;
  toExport = false;

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

  getKey(word, idx): string {
    const cssClass = 'word' + Number(idx + 1);
    this.seedPhraseBoundToClass.set(word, cssClass);
    return cssClass;
  }

  get seedPhrase(): string {
    const { seed } = api.createSeed();
    return seed;
  }

  get seedPhraseAsArray(): Array<string> {
    const seedArray = this.seedPhrase.split(' ').map((word) => word.toUpperCase());
    return seedArray;
  }

  get randomizedSeedPhrase(): Array<string> {
    return [...this.seedPhraseAsArray].sort(() => Math.random() - 0.5);
  }

  toggleVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
  }

  chooseWord(e: Event): void {
    const clickedWord = e.currentTarget;
    const targetClass = (clickedWord as HTMLElement).classList[1];
    (this.$refs[`${targetClass}`] as HTMLElement)[0].classList.add('word--hidden');
    const clickedWordText = ((clickedWord as HTMLElement).textContent as string).trim();
    this.$nextTick(() => {
      this.seedPhraseToCompare.push(clickedWordText);
    });
  }

  discardWord(e: Event): void {
    const clickedWordText = ((e.currentTarget as HTMLElement).textContent as string).trim();
    const wordToDiscard = this.seedPhraseBoundToClass.get(clickedWordText);
    (this.$refs[`${wordToDiscard}`] as HTMLElement)[0].classList.remove('word--hidden');
    this.seedPhraseToCompare = this.seedPhraseToCompare.filter((word) => word !== clickedWordText);
  }

  discardAllWords(): void {
    const wordsHtmlDOM = Array.from(new Array(this.PHRASE_LENGTH), (_, idx) => `word${idx + 1}`);
    wordsHtmlDOM.forEach((value) => {
      (this.$refs[value] as HTMLElement)[0].classList.remove('word--hidden');
    });
    wordsHtmlDOM.forEach((value) => {
      (this.$refs[value] as HTMLElement)[0].classList.add('login__random-word--incorrect');
    });
    setTimeout(() => {
      wordsHtmlDOM.forEach((value) => {
        (this.$refs[value] as HTMLElement)[0].classList.remove('login__random-word--incorrect');
      });
    }, 2000);
  }

  async handleCopy(): Promise<void> {
    await copyToClipboard(this.seedPhrase);
  }

  renderWord(column, index): boolean {
    if (column === 1 && index < 4) {
      return true;
    }

    if (column === 2 && index > 3 && index < 8) {
      return true;
    }

    if (column === 3 && index > 7 && index < 12) {
      return true;
    }

    return false;
  }

  nextStep(): void {
    this.$emit('stepChange', LoginStep.ConfirmSeedPhrase);
  }

  handleMnemonicCheck(): void {
    if (this.seedPhraseToCompare.length < this.PHRASE_LENGTH) {
      this.$emit('stepChange', LoginStep.CreateCredentials);
      return;
    }
    const isSeedPhraseMatched = isEqual(this.seedPhraseToCompare, this.seedPhrase);
    if (!isSeedPhraseMatched) {
      this.showErrorMessage = true;
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 4500);
      this.seedPhraseToCompare = [];
      this.runReturnAnimation();
    } else {
      this.$emit('stepChange', LoginStep.CreateCredentials);
    }
  }

  runReturnAnimation(): void {
    this.discardAllWords();
  }

  async createAccount(): Promise<void> {
    if (this.accountPassword === this.accountPasswordConfirm) {
      await api.createAccount(this.seedPhrase, this.accountName, this.accountPassword);
      await this.getPolkadotJsAccounts();

      if (this.toExport) {
        const accountJson = api.exportAccount(this.accountPassword);
        const blob = new Blob([accountJson], { type: 'application/json' });
        this.json.href = URL.createObjectURL(blob);
        this.json.setAttribute('download', JSON.parse(accountJson).address);
        this.json.click();
      }

      this.$emit('stepChange', LoginStep.AccountList);
    } else {
      this.$notify({
        message: `Passwords did not match`,
        type: 'error',
        title: '',
      });
    }
  }

  beforeUpdate() {
    if (this.step !== LoginStep.ConfirmSeedPhrase) {
      this.seedPhraseToCompare = [];
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

  &__random-order {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    width: 90% !important;
    margin: 0px auto calc(var(--s-size-small) / 2) auto;
  }

  &__correct-order {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    min-height: 160px;
    width: 90% !important;
    margin: var(--s-size-mini) auto;
  }

  &__random-word {
    button {
      background-color: #f4f0f1 !important;
      color: #000 !important;
    }

    margin: 6px 4px !important;

    span {
      font-weight: 400 !important;
    }

    &--incorrect {
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

  .download-json {
    display: none;
  }
}

.word--hidden {
  visibility: hidden;
}
</style>

<style lang="scss" scoped>
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
