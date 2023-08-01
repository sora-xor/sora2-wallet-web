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

      <file-uploader ref="uploader" accept="application/json" class="upload-json" @upload="handleUploadJson">
        <div class="placeholder">
          <s-icon class="upload-json__icon" name="el-icon-document" size="32px" />
          <span class="upload-json__placeholder">{{
            t('dragAndDropText', { extension: TranslationConsts.JSON })
          }}</span>
        </div>
      </file-uploader>

      <template v-if="jsonOnly">
        <s-card shadow="always" class="import-steps">
          <div v-for="(text, index) in importSteps" :key="index" class="import-step">
            <div class="import-step__count">{{ index + 1 }}</div>
            <div class="import-step__text">{{ text }}</div>
          </div>
        </s-card>

        <div class="export-tutorial">
          <div class="export-tutorial-title">{{ t('desktop.exportTutorialsText') }}</div>
          <div class="export-tutorial-grid">
            <a
              v-for="{ logo, title, link } in Tutorials"
              :key="title"
              :href="link"
              target="_blank"
              rel="nofollow noopener noreferrer"
              class="export-tutorial-grid-item"
            >
              <s-card shadow="always">
                <div class="extension-tutorial">
                  <img class="extension-tutorial-logo" :src="logo" />
                  <span class="extension-tutorial-title">{{ title }}</span>
                </div>
              </s-card>
            </a>
          </div>
        </div>
      </template>
    </template>
    <template v-else-if="step === LoginStep.ImportCredentials">
      <s-form :class="computedClasses" @submit.native.prevent="importAccount">
        <s-input
          :disabled="loading"
          :placeholder="t('desktop.accountName.placeholder')"
          :readonly="readonlyAccountName"
          v-model="accountName"
        ></s-input>

        <p v-if="!jsonOnly && !json" class="login__create-account-desc">{{ t('desktop.accountName.desc') }}</p>

        <password-input v-model="accountPassword" :disabled="loading" />

        <template v-if="!json">
          <p class="login__create-account-desc">{{ t('desktop.password.desc') }}</p>

          <s-input
            type="password"
            :disabled="loading"
            :placeholder="t('desktop.confirmPassword.placeholder')"
            v-model="accountPasswordConfirm"
          />
        </template>

        <s-button
          :disabled="disabledImportStep"
          :loading="loading"
          class="s-typography-button--large login-btn"
          key="step2"
          type="primary"
          native-type="submit"
        >
          {{ t('desktop.button.importAccount') }}
        </s-button>
      </s-form>
    </template>
  </div>
</template>

<script lang="ts">
import { mnemonicValidate } from '@polkadot/util-crypto';
import FearlessLogo from '@sora-test/wallet-connect/dotsama/predefinedWallet/FearlessWalletLogo.svg';
import PolkadotLogo from '@sora-test/wallet-connect/dotsama/predefinedWallet/PolkadotLogo.svg';
import SubWalletLogo from '@sora-test/wallet-connect/dotsama/predefinedWallet/SubWalletLogo.svg';
import { Mixins, Component, Prop, Ref } from 'vue-property-decorator';

import { LoginStep } from '../../../consts';
import { AppError, parseJson } from '../../../util';
import FileUploader from '../../FileUploader.vue';
import PasswordInput from '../../Input/Password.vue';
import NotificationMixin from '../../mixins/NotificationMixin';

import type { CreateAccountArgs, RestoreAccountArgs } from '../../../store/account/types';
import type { KeyringPair$Json } from '../../../types/common';

@Component({
  components: {
    FileUploader,
    PasswordInput,
  },
})
export default class ImportAccountStep extends Mixins(NotificationMixin) {
  @Prop({ type: String, required: true }) readonly step!: LoginStep;
  @Prop({ type: Boolean, default: false }) readonly jsonOnly!: boolean;
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean;
  @Prop({ type: Function, default: () => {} }) readonly createAccount!: (data: CreateAccountArgs) => Promise<void>;
  @Prop({ type: Function, default: () => {} }) readonly restoreAccount!: (data: RestoreAccountArgs) => Promise<void>;

  @Ref('uploader') readonly uploader!: HTMLFormElement;

  readonly Tutorials = [
    {
      logo: FearlessLogo,
      title: 'Fearless',
      link: 'https://wiki.fearlesswallet.io/accounts/walkthrough/exporting-and-importing-a-wallet-using-a-json-file',
    },
    {
      logo: PolkadotLogo,
      title: 'Polkadot{.js}',
      link: 'https://support.polkadot.network/support/solutions/articles/65000177677-how-to-export-your-json-backup-file',
    },
    {
      logo: SubWalletLogo,
      title: 'Subwallet',
      link: 'https://docs.subwallet.app/extension-user-guide/export-and-backup-an-account',
    },
  ];

  readonly LoginStep = LoginStep;

  readonly PHRASE_LENGTH = 12;

  mnemonicPhrase = '';
  accountName = '';
  accountPassword = '';
  accountPasswordConfirm = '';

  json: Nullable<KeyringPair$Json> = null;

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
    if (this.jsonOnly) return !(this.accountName && this.json && this.accountPassword);

    return !(this.accountName && this.accountPassword) || (!this.json && !this.accountPasswordConfirm);
  }

  get computedClasses(): string {
    const baseClass = ['login__inputs'];
    if (this.json) baseClass.push('login__inputs--json');
    return baseClass.join(' ');
  }

  get importSteps(): string[] {
    return [
      this.t('desktop.importSteps.selectWallet'),
      this.t('desktop.importSteps.selectAccount'),
      this.t('desktop.importSteps.exportAccount'),
    ];
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

  async handleUploadJson(jsonFile: File): Promise<void> {
    this.withAppNotification(async () => {
      if (!jsonFile) {
        return;
      }

      const parsedJson = await parseJson(jsonFile);
      const { address, encoded, encoding, meta } = parsedJson;

      if (!(address || encoded || encoding || meta)) {
        this.uploader.resetFileInput();
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
  &__title {
    margin-top: -54px;
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

.upload-json {
  @include drag-drop-content;
}

.import-steps {
  width: 100%;
}

.import-step {
  display: flex;
  align-items: center;
  padding: $basic-spacing-small 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--s-color-base-border-secondary);
  }

  &__count {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--s-size-small);
    height: var(--s-size-small);
    font-size: 24px;
    font-weight: 300;
    background: white;
    color: var(--s-color-base-content-tertiary);
    border-radius: 50%;
    text-align: center;
    margin-right: $basic-spacing-small;
  }

  &__text {
    font-size: var(--s-font-size-medium);
  }
}

.export-tutorial {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-small;
  width: 100%;

  &-title {
    font-weight: 600;
    font-size: var(--s-font-size-extra-small);
    text-transform: uppercase;
  }

  &-grid {
    display: flex;
    gap: $basic-spacing-small;

    &-item {
      @include focus-outline($withOffset: true);
      @include columns(3, $basic-spacing-mini);

      border-width: 1px;
      border-style: solid;
      border-color: transparent;
      border-radius: var(--s-border-radius-small);

      &:hover {
        border-color: var(--s-color-base-content-secondary);
      }
    }
  }
}

.extension-tutorial {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: $basic-spacing-mini;

  &-logo {
    width: var(--s-size-small);
    height: var(--s-size-small);
  }
}
</style>
