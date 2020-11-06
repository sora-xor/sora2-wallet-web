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
        <wallet-account :name="importFormData.name" />
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
import { Action, Getter } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import WalletAccount from './WalletAccount.vue'
import { RouteNames, SourceTypes, PasswordConditions } from '../consts'

@Component({
  components: { WalletBase, WalletAccount }
})
export default class WalletImport extends Mixins(TranslationMixin) {
  readonly SourceTypes = SourceTypes
  readonly PasswordConditions = PasswordConditions

  @Getter account
  @Action navigate
  @Action getAccount
  @Action login

  sourceType = SourceTypes.MnemonicSeed
  seed = ''
  step = 1
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

  handleBack (): void {
    if (this.step === 1) {
      this.navigate({ name: RouteNames.WalletConnection })
      return
    }
    this.step = 1
  }

  async handleImport (): Promise<void> {
    if (this.step === 1 && this.sourceType === SourceTypes.MnemonicSeed) {
      await this.getAccount({ seed: this.seed })
      this.importFormData.name = this.account.name
      this.step = 2
      return
    }
    if (this.sourceType === SourceTypes.RawSeed) {
      // logic for RawSeed import
    } else {
      const { name, password } = this.importFormData
      await this.login({ name, password })
    }
    this.navigate({ name: RouteNames.Wallet })
  }
}
</script>

<style scoped lang="scss">
@import '../styles/typography';
@import '../styles/layout';
@import '../styles/variables';
@import '../styles/soramitsu-variables';

$avatar-size: 32px;
$font-size-hint: $font-size_small;

@mixin secondary-text {
  color: $s-color-base-content-tertiary;
  font-size: $font-size-hint;
  line-height: 1.8;
}
.wallet-import {
  &-hint {
    @include secondary-text;
  }
  &-condition {
    @include secondary-text;
    .s-icon-check-mark {
      color: $s-color-base-content-tertiary;
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
