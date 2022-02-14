<template>
  <div>
    <div class="login__title">{{ title }}</div>
    <template v-if="step === LoginStep.Import">
      <s-input
        class="input-textarea"
        type="textarea"
        :placeholder="t('desktop.accountMnemonic.placeholder')"
        :disabled="loading"
        :maxlength="255"
        v-model="mnemonicPhrase"
        @input="handleMnemonicInput"
      />
      <p class="line">or</p>
      <s-button @click="nextStep" class="s-typography-button--large login-btn"> Import .JSON </s-button>
      <s-button @click="nextStep" :disabled="disabled" class="s-typography-button--large login-btn" type="primary">
        {{ t('desktop.button.next') }}
      </s-button>
    </template>
    <template v-else-if="step === LoginStep.ImportCredentials">
      <div class="login__inputs">
        <s-input
          :placeholder="t('desktop.accountName.placeholder')"
          v-model="accountName"
          :disabled="loading"
        ></s-input>
        <s-input :placeholder="t('desktop.password.placeholder')" v-model="accountPassword" :disabled="loading">
        </s-input>
      </div>
      <s-button @click="importAccount" :disabled="disabled" class="s-typography-button--large login-btn" type="primary">
        {{ t('desktop.button.importAccount') }}
      </s-button>
    </template>
  </div>
</template>

<script lang="ts">
import { LoginStep } from '../../../consts';
import { Mixins, Component, Prop } from 'vue-property-decorator';
import TranslationMixin from '../../mixins/TranslationMixin';
import LoadingMixin from '@/components/mixins/LoadingMixin';

@Component
export default class ImportAccount extends Mixins(TranslationMixin, LoadingMixin) {
  @Prop({ type: String }) readonly step!: LoginStep;

  LoginStep = LoginStep;

  mnemonicPhrase = '';
  accountName = '';
  accountPassword = '';

  get title(): string {
    if (this.step === LoginStep.Import) return this.t('desktop.heading.importTitle');
    if (this.step === LoginStep.ImportCredentials) return this.t('desktop.heading.accountDetailsTitle');
    return '';
  }

  get disabled(): boolean {
    return false;
  }

  handleMnemonicInput(char) {
    const letter = char.replace('.', '').replace('  ', ' ');

    if (/^[a-z ]+$/.test(letter)) this.mnemonicPhrase = letter;
  }

  nextStep(): void {
    this.$emit('stepChange', LoginStep.ImportCredentials);
  }

  importAccount(): void {
    // api call to import account
  }
}
</script>

<style lang="scss" scoped>
.login {
  &__inputs {
    margin-top: 24px;
  }
}
.line {
  width: 100%;
  display: flex;
  flex-direction: row;
  text-transform: uppercase;
  color: var(--s-color-base-content-secondary);
}

.line::before,
.line::after {
  content: '';
  flex: 1 1;
  border-bottom: 2px solid var(--s-color-base-content-tertiary);
  margin: auto;
  margin-left: 10px;
  margin-right: 10px;
}

.input-textarea {
  margin-top: 30px !important;
}
</style>
