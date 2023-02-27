<template>
  <div class="login">
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
      <s-button @click="importJson" class="s-typography-button--large login-btn">
        {{ t('importText') }} .JSON
      </s-button>
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
      <s-form :class="computedClasses">
        <s-input
          :placeholder="t('desktop.accountName.placeholder')"
          v-model="accountName"
          :disabled="loading"
          :readonly="readonlyAccountName"
        ></s-input>
        <p v-if="!json" class="login__create-account-desc">{{ t('desktop.accountName.desc') }}</p>
        <s-input
          :type="inputType"
          :placeholder="t('desktop.password.placeholder')"
          v-model="accountPassword"
          :disabled="loading"
        >
          <s-icon :name="iconPasswordStyle" class="eye-icon" size="18" slot="suffix" @click.native="toggleVisibility" />
        </s-input>
        <template v-if="!json">
          <p class="login__create-account-desc">{{ t('desktop.password.desc') }}</p>
          <s-input
            type="password"
            :placeholder="t('desktop.confirmPassword.placeholder')"
            v-model="accountPasswordConfirm"
            :disabled="loading"
          />
        </template>
      </s-form>

      <s-button
        @click="importAccount"
        key="step2"
        :disabled="disabledImportStep"
        :loading="loading"
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
import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';
import { KeyringPair$Json } from '../../../types/common';
import { AppError, parseJson, delay } from '../../../util';
import { LoginStep } from '../../../consts';
import { action } from '../../../store/decorators';

@Component
export default class ImportAccount extends Mixins(NotificationMixin, LoadingMixin) {
  @Prop({ type: String, required: true }) readonly step!: LoginStep;

  @action.account.restoreAccountFromJson private restoreAccountFromJson!: (data: {
    password: string;
    json: KeyringPair$Json;
  }) => Promise<void>;

  @action.account.createAccount private createAccount!: (data: {
    seed: string;
    name: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<void>;

  @Ref('fileInput') readonly fileInput!: HTMLInputElement;

  readonly LoginStep = LoginStep;

  readonly PHRASE_LENGTH = 12;

  mnemonicPhrase = '';
  accountName = '';
  accountPassword = '';
  accountPasswordConfirm = '';

  json: Nullable<KeyringPair$Json> = null;

  hiddenInput = true;
  readonlyAccountName = false;

  get title(): string {
    switch (this.step) {
      case LoginStep.Import:
        return this.t('desktop.heading.importTitle');
      case LoginStep.ImportCredentials:
        return this.t('desktop.heading.accountDetailsTitle');
      default:
        return '';
    }
  }

  get disabledNextStep(): boolean {
    return this.mnemonicPhrase.length === 0;
  }

  get disabledImportStep(): boolean {
    return !(this.accountName && this.accountPassword) || (!this.json && !this.accountPasswordConfirm);
  }

  get inputType(): string {
    return this.hiddenInput ? 'password' : 'text';
  }

  get iconPasswordStyle(): string {
    return this.hiddenInput ? 'basic-eye-no-24' : 'basic-filterlist-24';
  }

  get computedClasses(): string {
    const baseClass = ['login__inputs'];
    if (this.json) baseClass.push('login__inputs--json');
    return baseClass.join(' ');
  }

  toggleVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
  }

  handleMnemonicInput(char) {
    const letter = char.replace('.', '').replace('  ', ' ');

    if (/^[a-z ]+$/.test(letter)) this.mnemonicPhrase = letter;
  }

  nextStep(): void {
    this.withAppNotification(async () => {
      try {
        if (this.mnemonicPhrase.trim().split(' ').length !== this.PHRASE_LENGTH) {
          throw new AppError({ key: 'desktop.errorMessages.mnemonicLength', payload: { number: this.PHRASE_LENGTH } });
        }
        if (!mnemonicValidate(this.mnemonicPhrase)) {
          throw new AppError({ key: 'desktop.errorMessages.mnemonic' });
        }

        this.$emit('update:step', LoginStep.ImportCredentials);
      } catch (error) {
        this.mnemonicPhrase = '';
        throw error;
      }
    });
  }

  importJson(): void {
    this.fileInput.click();
  }

  async handleUploadJson(e): Promise<void> {
    this.withAppNotification(async () => {
      const jsonFile = e.target.files[0];

      if (!jsonFile) {
        return;
      }

      const parsedJson = await parseJson(jsonFile);
      const name = parsedJson.meta.name as string;
      const { address, encoded, encoding } = parsedJson;

      if (!address && !encoded && !encoding && !name) {
        throw new AppError({ key: 'desktop.errorMessages.jsonFields' });
      }

      this.accountName = name;
      this.readonlyAccountName = true;
      this.json = parsedJson;
      this.mnemonicPhrase = '';
      this.$emit('update:step', LoginStep.ImportCredentials);
    });
  }

  async importAccount(): Promise<void> {
    if (this.json) {
      this.handleJsonInput(this.json);
    } else {
      this.handleCredentialsInput();
    }
  }

  async handleJsonInput(json: KeyringPair$Json): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution
      await delay(500);

      await this.withAppNotification(async () => {
        try {
          await this.restoreAccountFromJson({ json, password: this.accountPassword });
          this.$emit('update:step', LoginStep.AccountList);
        } catch (error) {
          this.accountPassword = '';
          throw error;
        }
      });
    });
  }

  async handleCredentialsInput(): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution
      await delay(500);

      await this.withAppNotification(async () => {
        await this.createAccount({
          seed: this.mnemonicPhrase,
          name: this.accountName,
          password: this.accountPassword,
          passwordConfirm: this.accountPasswordConfirm,
        });

        this.$emit('update:step', LoginStep.AccountList);
      });
    });
  }
}
</script>

<style lang="scss" scoped>
@include account-create-import-view;

.login {
  &__inputs {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    &--json {
      gap: calc(var(--s-size-small) / 2);
    }
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
