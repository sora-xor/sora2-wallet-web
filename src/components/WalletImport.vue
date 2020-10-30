<template>
  <wallet-base :title="t('import.title')" show-back @back="handleBack">
    <div class="wallet-import">
      <template v-if="step === 1">
        <s-select :placeholder="t('import.sourceType.placeholder')" v-model="sourceType">
          <s-option
            v-for="type in SourceTypes"
            :key="type"
            :value="type"
            :label="t(`import.sourceType.${type}`)"
          />
        </s-select>
        <s-input type="textarea" :placeholder="t(`import.${sourceType}.placeholder`)" v-model="seed" />
        <div class="wallet-import-hint">{{ t(`import.${sourceType}.hint`) }}</div>
      </template>
      <template v-else>
        <s-card :bodyStyle="{ padding: '0 12px' }">
          <div class="wallet-import-account s-flex">
            <div class="avatar" />
            <div class="credentials s-flex">
              <span v-if="importFormData.name" class="credentials-name">{{ importFormData.name }}</span>
              <span class="credentials-address">{{ generatedAddressMock }}</span>
            </div>
            <s-icon class="copy" name="copy" @click="handleCopyAddress" />
          </div>
        </s-card>
        <s-input :placeholder="t(`import.${sourceType}.name.placeholder`)" v-model="importFormData.name" />
        <div class="wallet-import-hint">{{ t(`import.${sourceType}.name.hint`) }}</div>
        <s-input show-password :placeholder="t(`import.${sourceType}.password.placeholder`)" v-model="importFormData.password" />
        <div>
          <div class="wallet-import-condition" v-for="condition in PasswordConditions" :key="condition.title">
            <s-icon name="check-mark" :class="{ 'error': !condition.regexp.test(importFormData.password) }" />
            <span>{{ t(`import.${sourceType}.password.${condition.title}`) }}</span>
          </div>
        </div>
        <s-input show-password :placeholder="t(`import.${sourceType}.repeatedPassword.placeholder`)" v-model="importFormData.repeatedPassword" />
        <div class="wallet-import-hint">{{ t(`import.${sourceType}.password.hint`) }}</div>
      </template>
      <s-button
        type="primary"
        size="medium"
        :disabled="disabled"
        @click="handleImport"
      >
        {{ t('import.action') }}
      </s-button>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames, SourceTypes, PasswordConditions } from '../consts'

@Component({
  components: { WalletBase }
})
export default class WalletImport extends Mixins(TranslationMixin) {
  readonly SourceTypes = SourceTypes
  readonly PasswordConditions = PasswordConditions

  @Action navigate

  sourceType = SourceTypes.MnemonicSeed
  seed = ''
  step = 1
  generatedAddressMock = '5HVmWWpBi69cmmDGdfgg53dfgxxJ2pveRnfozNg5K'
  importFormData = {
    name: '',
    password: '',
    repeatedPassword: ''
  }

  get disabled (): boolean {
    return this.step === 1
      ? !this.seed
      : (
        Object.values(this.importFormData).some(prop => !prop) ||
        PasswordConditions.map(({ regexp }) => regexp).some(regexp => !regexp.test(this.importFormData.password)) ||
        this.importFormData.password !== this.importFormData.repeatedPassword
      )
  }

  handleCopyAddress (): void {}

  handleBack (): void {
    if (this.step === 1) {
      this.navigate({ name: RouteNames.WalletConnection })
      return
    }
    this.step = 1
  }

  handleImport (): void {
    if (this.step === 1 && this.sourceType === SourceTypes.MnemonicSeed) {
      this.step = 2
      return
    }
    if (this.sourceType === SourceTypes.RawSeed) {
      // logic for RawSeed import
    } else {
      // logic for MnemonicSeed import
    }
    this.navigate({ name: RouteNames.Wallet })
  }
}
</script>

<style scoped lang="scss">
@import '../styles/typography';
@import '../styles/colors';
@import '../styles/layout';
@import '../styles/variables';

$avatar-size: 32px;
$font-size-hint: $font-size_small;

.secondary-text {
  color: $s-color-content-tertiary;
  font-size: $font-size-hint;
  line-height: 1.8;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-import {
  &-hint {
    @extend .secondary-text;
  }
  &-account {
    margin: $basic-spacing_mini 0;
    .avatar {
      margin-right: $basic-spacing_small;
      background-image: url('../assets/img/avatar-mock.svg');
      width: $avatar-size;
      height: $avatar-size;
    }
    .credentials {
      max-width: calc(#{$wallet-width} - 128px);
      flex-direction: column;
      justify-content: center;
      &-name {
        font-size: $font-size_basic;
        @extend .text-ellipsis;
      }
      &-address {
        color: $s-color-content-tertiary;
        font-size: $font-size_small;
        @extend .text-ellipsis;
      }
    }
    .copy {
      text-align: right;
      cursor: pointer;
    }
  }
  &-condition {
    @extend .secondary-text;
    .s-icon-check-mark {
      color: $s-color-content-tertiary;
      &.error {
        color: $s-color-status-error;
      }
    }
  }
  > button {
    width: 100%;
  }
  > :not(:last-child) {
    margin-bottom: $basic-spacing;
  }
}
</style>
