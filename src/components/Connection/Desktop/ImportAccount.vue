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
      <s-button
        @click="nextStep"
        key="step1"
        :disabled="disabled"
        class="s-typography-button--large login-btn"
        type="primary"
      >
        {{ t('desktop.button.next') }}
      </s-button>
    </template>
    <template v-else-if="step === LoginStep.ImportCredentials">
      <s-form class="login__inputs">
        <s-input
          :placeholder="t('desktop.accountName.placeholder')"
          v-model="accountName"
          :disabled="loading"
        ></s-input>
        <s-input
          :type="inputType"
          :placeholder="t('desktop.password.placeholder')"
          v-model="accountPassword"
          :disabled="loading"
        >
          <s-icon :name="iconPasswordStyle" class="eye-icon" size="18" slot="suffix" @click.native="toggleVisibility" />
        </s-input>
      </s-form>

      <s-button
        @click="importAccount"
        key="step2"
        :disabled="disabled"
        class="s-typography-button--large login-btn"
        type="primary"
      >
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
import { api } from '@sora-substrate/util';
import { PolkadotJsAccount } from '@/types/common';
import { Getter } from 'vuex-class';

@Component
export default class ImportAccount extends Mixins(TranslationMixin, LoadingMixin) {
  @Prop({ type: String }) readonly step!: LoginStep;

  @Getter polkadotJsAccounts!: Array<PolkadotJsAccount>;

  LoginStep = LoginStep;

  mnemonicPhrase = '';
  accountName = '';
  accountPassword = '';

  hiddenInput = true;

  get title(): string {
    if (this.step === LoginStep.Import) return this.t('desktop.heading.importTitle');
    if (this.step === LoginStep.ImportCredentials) return this.t('desktop.heading.accountDetailsTitle');
    return '';
  }

  get disabled(): boolean {
    return false;
  }

  get inputType(): string {
    return this.hiddenInput ? 'password' : 'text';
  }

  get iconPasswordStyle(): string {
    return this.hiddenInput ? 'basic-eye-no-24' : 'basic-filterlist-24';
  }

  toggleVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
  }

  handleMnemonicInput(char) {
    const letter = char.replace('.', '').replace('  ', ' ');
    // letter = letter.replace(/[0-9]/, '');

    if (/^[a-z ]+$/.test(letter)) this.mnemonicPhrase = letter;
  }

  nextStep(): void {
    this.$emit('stepChange', LoginStep.ImportCredentials);
  }

  async importAccount(): Promise<void> {
    const account = await api.importAccount(
      'salute sniff lift general bus space easy tiny purse puppy seven spoil',
      'desktop',
      'desktop'
    );

    this.enterAccount(account);
  }

  async enterAccount(account: PolkadotJsAccount): Promise<void> {
    await this.withLoading(async () => {
      try {
        await this.importPolkadotJs(account.address);
      } catch (error) {
        this.$alert(this.t((error as Error).message), this.t('errorText'));
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.login {
  &__inputs {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
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

.eye-icon:hover {
  cursor: pointer;
}
</style>
