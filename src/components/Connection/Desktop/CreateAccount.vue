<template>
  <div>
    <div class="login__title">{{ title }}</div>
    <div class="login__step-count">Step {{ stepNumber }} / 3</div>
    <template v-if="step === LoginStep.SeedPhrase">
      <div class="seed-grid">
        <div v-for="column in 3" :key="column" class="seed-grid__column">
          <div v-for="(word, idx) in sortedSeedPhrase" :key="word">
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
      <s-button key="step3" @click="createAccount" class="s-typography-button--large login-btn" type="primary">{{
        t('desktop.button.createAccount')
      }}</s-button>
    </template>
  </div>
</template>

<script lang="ts">
import { isEqual } from 'lodash';
import LoadingMixin from '@/components/mixins/LoadingMixin';
import { Mixins, Component, Prop } from 'vue-property-decorator';

import TranslationMixin from '../../../components/mixins/TranslationMixin';
import { LoginStep } from '../../../consts';
import { copyToClipboard } from '../../../util';

@Component
export default class CreateAccount extends Mixins(TranslationMixin, LoadingMixin) {
  @Prop({ type: String }) readonly step!: LoginStep;

  readonly LoginStep = LoginStep;
  readonly PHRASE_LENGTH = 12;

  accountName = '';
  accountPassword = '';
  accountPasswordConfirm = '';

  seedPhraseToCompare: Array<string | undefined> = [];
  seedPhraseBoundToClass = new Map<string | undefined, string>();

  showErrorMessage = false;
  hiddenInput = true;

  get title(): string {
    if (this.step === LoginStep.SeedPhrase) return this.t('desktop.heading.seedPhraseTitle');
    if (this.step === LoginStep.ConfirmSeedPhrase) return this.t('desktop.heading.confirmSeedTitle');
    if (this.step === LoginStep.CreateCredentials) return this.t('desktop.heading.accountDetailsTitle');
    return '';
  }

  get stepNumber(): number {
    if (this.step === LoginStep.SeedPhrase) return 1;
    if (this.step === LoginStep.ConfirmSeedPhrase) return 2;
    if (this.step === LoginStep.CreateCredentials) return 3;
    return 1;
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

  getKey(word, idx): string {
    const cssClass = 'word' + Number(idx + 1);
    this.seedPhraseBoundToClass.set(word, cssClass);
    return cssClass;
  }

  get seedPhrase(): Array<string> {
    return [
      'TIGER',
      'IDLE',
      'DUTCH',
      'HUNGRY',
      'MERRY',
      'EARLY',
      'MOON',
      'SMOOTH',
      'PARROT',
      'COOL',
      'CLIENT',
      'TOILET',
    ];
  }

  get sortedSeedPhrase(): Array<string> {
    return this.seedPhrase;
  }

  get randomizedSeedPhrase(): Array<string> {
    return [...this.seedPhrase].sort(() => Math.random() - 0.5);
  }

  toggleVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
  }

  chooseWord(e: Event): void {
    const clickedWord = e.currentTarget;
    const targetClass = (clickedWord as HTMLElement).classList[1];
    this.$refs[`${targetClass}`]?.[0].classList.add('word--hidden');
    const clickedWordText = (clickedWord as HTMLElement).textContent?.trim();
    this.$nextTick(() => {
      this.seedPhraseToCompare.push(clickedWordText);
    });
  }

  discardWord(e: Event): void {
    const clickedWordText = (e.currentTarget as HTMLElement).textContent?.trim();
    const wordToDiscard = this.seedPhraseBoundToClass.get(clickedWordText);
    this.$refs[`${wordToDiscard}`]?.[0].classList.remove('word--hidden');
    this.seedPhraseToCompare = this.seedPhraseToCompare.filter((word) => word !== clickedWordText);
  }

  discardAllWords(): void {
    const wordsHtmlDOM = Array.from(new Array(this.PHRASE_LENGTH), (_, idx) => `word${idx + 1}`);
    wordsHtmlDOM.map((value) => {
      this.$refs[value]?.[0].classList.remove('word--hidden');
    });
    wordsHtmlDOM.map((value) => {
      this.$refs[value]?.[0].classList.add('login__random-word--incorrect');
    });
    setTimeout(() => {
      wordsHtmlDOM.map((value) => {
        this.$refs[value]?.[0].classList.remove('login__random-word--incorrect');
      });
    }, 2000);
  }

  async handleCopy(): Promise<void> {
    await copyToClipboard(this.seedPhrase.join(' '));
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

  createAccount(): void {
    // submit creds...
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
    font-size: 12px !important;

    .s-icon-basic-copy-24 {
      margin-left: 6px;
    }
  }

  &__random-order {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    width: 90% !important;
    margin: 0px auto 16px auto;
  }

  &__correct-order {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    min-height: 160px;
    width: 90% !important;
    margin: 24px auto;
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
    margin-bottom: 12px;
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

    p {
    }
  }

  .eye-icon:hover {
    cursor: pointer;
  }

  .delimiter {
    margin: 16px 0 24px 0;
    width: 100%;
    height: 1px;
    background-color: var(--s-color-base-content-tertiary);
  }
}

.word--hidden {
  visibility: hidden;
}
</style>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
