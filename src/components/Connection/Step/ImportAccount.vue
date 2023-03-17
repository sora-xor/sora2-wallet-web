<template>
  <div class="login">
    <div class="login__title">{{ title }}</div>
    <template v-if="step === LoginStep.Import">
      <template v-if="!jsonOnly">
        <s-input
          :disabled="loading"
          :placeholder="t('desktop.accountMnemonic.placeholder')"
          :maxlength="255"
          v-model="mnemonicPhrase"
          class="input-textarea"
          type="textarea"
          @input="handleMnemonicInput"
        />
        <s-button
          :disabled="disabledNextStep"
          class="s-typography-button--large login-btn"
          key="step1"
          type="primary"
          @click="nextStep"
        >
          {{ t('desktop.button.next') }}
        </s-button>
        <p class="line">or</p>
      </template>

      <p v-if="jsonOnly" class="login__text">
        {{ t('desktop.exportJsonDescriptionText') }}
      </p>

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
    </template>
    <template v-else-if="step === LoginStep.ImportCredentials">
      <s-form :class="computedClasses">
        <s-input
          :disabled="loading"
          :placeholder="t('desktop.accountName.placeholder')"
          :readonly="readonlyAccountName"
          v-model="accountName"
        ></s-input>

        <p v-if="!jsonOnly && !json" class="login__create-account-desc">{{ t('desktop.accountName.desc') }}</p>

        <template v-if="!jsonOnly">
          <s-input
            :type="inputType"
            :disabled="loading"
            :placeholder="t('desktop.password.placeholder')"
            v-model="accountPassword"
          >
            <s-icon
              :name="iconPasswordStyle"
              class="eye-icon"
              size="18"
              slot="suffix"
              @click.native="toggleVisibility"
            />
          </s-input>

          <template v-if="!json">
            <p class="login__create-account-desc">{{ t('desktop.password.desc') }}</p>
            <s-input
              type="password"
              :disabled="loading"
              :placeholder="t('desktop.confirmPassword.placeholder')"
              v-model="accountPasswordConfirm"
            />
          </template>
        </template>
      </s-form>

      <s-button
        :disabled="disabledImportStep"
        :loading="loading"
        class="s-typography-button--large login-btn"
        key="step2"
        type="primary"
        @click="importAccount"
      >
        {{ t('desktop.button.importAccount') }}
      </s-button>
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Ref } from 'vue-property-decorator';
import { mnemonicValidate } from '@polkadot/util-crypto';

import NotificationMixin from '../../mixins/NotificationMixin';

import { AppError, parseJson } from '../../../util';
import { LoginStep } from '../../../consts';

import type { KeyringPair$Json } from '../../../types/common';
import type { CreateAccountArgs, RestoreAccountArgs } from '../../../store/account/types';

@Component
export default class ImportAccountStep extends Mixins(NotificationMixin) {
  @Prop({ type: String, required: true }) readonly step!: LoginStep;
  @Prop({ type: Boolean, default: false }) readonly jsonOnly!: boolean;
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean;
  @Prop({ type: Function, default: () => {} }) readonly createAccount!: (data: CreateAccountArgs) => Promise<void>;
  @Prop({ type: Function, default: () => {} }) readonly restoreAccount!: (data: RestoreAccountArgs) => Promise<void>;

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
    if (this.jsonOnly) return !(this.accountName && this.json);

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
      const { address, encoded, encoding, meta } = parsedJson;

      if (!(address || encoded || encoding || meta)) {
        throw new AppError({ key: 'desktop.errorMessages.jsonFields' });
      }

      this.accountName = meta.name as string;
      this.readonlyAccountName = true;
      this.json = parsedJson;
      this.mnemonicPhrase = '';
      this.$emit('update:step', LoginStep.ImportCredentials);
    });
  }

  async importAccount(): Promise<void> {
    if (this.json) {
      await this.restoreAccount({ json: this.json, password: this.accountPassword });
    } else {
      await this.createAccount({
        seed: this.mnemonicPhrase,
        name: this.accountName,
        password: this.accountPassword,
        passwordConfirm: this.accountPasswordConfirm,
      });
    }

    this.accountPassword = '';
    this.accountPasswordConfirm = '';
  }
}
</script>

<style lang="scss" scoped>
@include login-view;

.login {
  &__inputs {
    display: flex;
    flex-direction: column;
    gap: $basic-spacing-medium;
  }

  .json-upload {
    display: none;
  }

  .input-textarea.s-textarea {
    margin-bottom: 0;
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

.eye-icon:hover {
  cursor: pointer;
}
</style>
