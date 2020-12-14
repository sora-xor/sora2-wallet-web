<template>
  <wallet-base :title="t('import.title')" show-back @back="handleBack">
    <div class="wallet-import">
      <template v-if="step === 1">
        <s-select :placeholder="t('import.sourceType.placeholder')" v-model="sourceType" border-radius="mini">
          <s-option
            v-for="type in SourceTypes"
            :key="type"
            :value="type"
            :label="t(`import.sourceType.${type}`)"
          />
        </s-select>
        <s-input type="textarea" :placeholder="t(`import.${sourceType}.placeholder`)" v-model="seed" border-radius="mini" />
        <div class="wallet-import-hint">{{ t(`import.${sourceType}.hint`) }}</div>
      </template>
      <template v-else>
        <wallet-account :name="importFormData.name" />
        <s-input :placeholder="t(`import.${sourceType}.name.placeholder`)" v-model="importFormData.name" border-radius="mini" />
        <div class="wallet-import-hint">{{ t(`import.${sourceType}.name.hint`) }}</div>
        <s-input show-password :placeholder="t(`import.${sourceType}.password.placeholder`)" v-model="importFormData.password" border-radius="mini" />
        <div>
          <div class="wallet-import-condition" v-for="condition in PasswordConditions" :key="condition.title">
            <s-icon name="check-mark" :class="{ 'error': !condition.regexp.test(importFormData.password) }" />
            <span>{{ t(`import.${sourceType}.password.${condition.title}`) }}</span>
          </div>
        </div>
        <s-input show-password :placeholder="t(`import.${sourceType}.repeatedPassword.placeholder`)" v-model="importFormData.repeatedPassword" border-radius="mini" />
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

  @Action navigate
  @Action login
  @Action checkValidSeed

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
      // TODO: add validation
      const isValid = this.checkValidSeed({ seed: this.seed })
      this.step = 2
      return
    }
    if (this.sourceType === SourceTypes.RawSeed) {
      // logic for RawSeed import
    } else {
      const { name, password } = this.importFormData
      await this.login({ name, password, seed: this.seed })
    }
    this.navigate({ name: RouteNames.Wallet })
  }
}
</script>

<style lang="scss">
@include select-icon('wallet-import');
</style>

<style scoped lang="scss">
$valid-icon-size: 6px;

.wallet-import {
  &-hint,
  &-condition {
    @include hint-text(true);
  }
  &-condition {
    display: inline-flex;
    align-items: center;
    width: 100%;
    .s-icon-check-mark {
      display: block;
      margin-left: $valid-icon-size;
      margin-right: $valid-icon-size;
      width: $valid-icon-size * 2;
      font-weight: bold;
      color: var(--s-color-status-success);
      &.error {
        position: relative;
        &:before {
          content: "";
          position: absolute;
          display: block;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: auto;
          background-color: var(--s-color-base-content-tertiary);
          border-radius: 50%;
          height: $valid-icon-size;
          width: $valid-icon-size;
        }
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
