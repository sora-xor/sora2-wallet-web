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
      <input
        ref="fileInput"
        id="contentFile"
        type="file"
        accept="application/json"
        class="json-upload"
        @change="handleUploadJson"
      />
      <s-button @click="importJson" class="s-typography-button--large login-btn"> Import .JSON </s-button>
      <s-button
        @click="nextStep"
        key="step1"
        :disabled="disabledNextStep"
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
          :readonly="readonlyAccountName"
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
        :disabled="disabledImportStep"
        class="s-typography-button--large login-btn"
        type="primary"
      >
        {{ t('desktop.button.importAccount') }}
      </s-button>
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Ref } from 'vue-property-decorator';
import { mnemonicValidate } from '@polkadot/util-crypto';
import { api } from '@sora-substrate/util';
import LoadingMixin from '@/components/mixins/LoadingMixin';
import TranslationMixin from '../../mixins/TranslationMixin';
import { PolkadotJsAccount, KeyringPair$Json } from '../../../types/common';
import { parseJson } from '../../../util';
import { LoginStep } from '../../../consts';
import { getter, action } from '../../../store/decorators';

@Component
export default class ImportAccount extends Mixins(TranslationMixin, LoadingMixin) {
  @Prop({ type: String }) readonly step!: LoginStep;

  @getter.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @action.account.importPolkadotJs importPolkadotJs!: (address: string) => Promise<void>;
  @action.account.getPolkadotJsAccounts getPolkadotJsAccounts!: () => Promise<void>;

  @Ref('fileInput') readonly fileInput!: HTMLInputElement;

  LoginStep = LoginStep;

  readonly PHRASE_LENGTH = 12;

  mnemonicPhrase = '';
  accountName = '';
  accountPassword = '';

  json: KeyringPair$Json | null = null;

  hiddenInput = true;
  readonlyAccountName = false;

  get title(): string {
    if (this.step === LoginStep.Import) return this.t('desktop.heading.importTitle');
    if (this.step === LoginStep.ImportCredentials) return this.t('desktop.heading.accountDetailsTitle');
    return '';
  }

  get disabledNextStep(): boolean {
    return this.mnemonicPhrase.length === 0;
  }

  get disabledImportStep(): boolean {
    return !(!!this.accountName && !!this.accountPassword);
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

    if (/^[a-z ]+$/.test(letter)) this.mnemonicPhrase = letter;
  }

  nextStep(): void {
    if (this.mnemonicPhrase.trim().split(' ').length !== this.PHRASE_LENGTH) {
      this.$notify({
        message: this.t('desktop.errorMessages.mnemonicLength', { number: this.PHRASE_LENGTH }),
        type: 'error',
        title: '',
      });
      this.mnemonicPhrase = '';
      return;
    }

    if (!mnemonicValidate(this.mnemonicPhrase)) {
      this.$notify({
        message: this.t('desktop.errorMessages.mnemonic'),
        type: 'error',
        title: '',
      });
      this.mnemonicPhrase = '';
      return;
    }

    this.$emit('stepChange', LoginStep.ImportCredentials);
  }

  importJson(): void {
    this.fileInput.click();
  }

  async handleUploadJson(e): Promise<void> {
    try {
      const jsonFile = e.target.files[0];
      if (!jsonFile) {
        return;
      }

      const parsedJson = await parseJson(jsonFile);
      let name;
      try {
        const address = (parsedJson as KeyringPair$Json).address;
        const encoded = (parsedJson as KeyringPair$Json).encoded;
        const encoding = (parsedJson as KeyringPair$Json).encoding;
        name = (parsedJson as KeyringPair$Json).meta.name;
      } catch {
        this.$notify({
          message: this.t('desktop.errorMessages.jsonFields'),
          type: 'error',
          title: '',
        });

        return;
      }

      this.accountName = name;
      this.readonlyAccountName = true;
      this.json = parsedJson;
      this.$emit('stepChange', LoginStep.ImportCredentials);
    } catch (err) {
      this.$notify({
        message: this.t('unknownErrorText'),
        type: 'error',
        title: '',
      });
    }
  }

  async importAccount(): Promise<void> {
    if (this.json) {
      this.handleJsonInput(this.json);
    } else {
      this.handleCredentialsInput();
    }
  }

  async handleJsonInput(json: KeyringPair$Json): Promise<void> {
    try {
      api.restoreFromJson(json, this.accountPassword);
      await this.getPolkadotJsAccounts();
      this.$emit('stepChange', LoginStep.AccountList);
    } catch (error) {
      if (error.message === 'Unable to decode using the supplied passphrase') {
        this.$notify({
          message: this.t('desktop.errorMessages.password'),
          type: 'error',
          title: '',
        });
      } else {
        this.$notify({
          message: this.t('unknownErrorText'),
          type: 'error',
          title: '',
        });
      }
      this.accountPassword = '';
    }
  }

  async handleCredentialsInput() {
    try {
      await api.createAccount(this.mnemonicPhrase, this.accountName, this.accountPassword);
      await this.getPolkadotJsAccounts();
      this.$emit('stepChange', LoginStep.AccountList);
    } catch (error) {
      if (error.message === 'Invalid bip39 mnemonic specified') {
        this.$notify({
          message: this.t('desktop.errorMessages.mnemonic'),
          type: 'error',
          title: '',
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
  &__inputs {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: calc(var(--s-size-small) / 2);
  }

  .json-upload {
    display: none;
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
