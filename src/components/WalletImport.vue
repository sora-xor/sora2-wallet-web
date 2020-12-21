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
        <template v-if="sourceType !== SourceTypes.PolkadotJs">
          <s-input type="textarea" :placeholder="t(`import.${sourceType}.placeholder`)" v-model="seed" border-radius="mini" />
          <div class="wallet-import-hint">{{ t(`import.${sourceType}.hint`) }}</div>
        </template>
      </template>
      <template v-else>
        <template v-if="sourceType !== SourceTypes.PolkadotJs">
          <wallet-account :name="importFormData.name" />
          <s-input
            :placeholder="t(`import.${SourceTypes.MnemonicSeed}.name.placeholder`)"
            v-model="importFormData.name"
            border-radius="mini"
          />
          <div class="wallet-import-hint">{{ t(`import.${SourceTypes.MnemonicSeed}.name.hint`) }}</div>
          <s-input
            show-password
            :placeholder="t(`import.${SourceTypes.MnemonicSeed}.password.placeholder`)"
            v-model="importFormData.password"
            border-radius="mini"
          />
          <div>
            <div class="wallet-import-condition" v-for="condition in PasswordConditions" :key="condition.title">
              <s-icon name="check-mark" :class="{ 'error': !condition.regexp.test(importFormData.password) }" />
              <span>{{ t(`import.${SourceTypes.MnemonicSeed}.password.${condition.title}`) }}</span>
            </div>
          </div>
          <s-input
            show-password
            :placeholder="t(`import.${SourceTypes.MnemonicSeed}.repeatedPassword.placeholder`)"
            v-model="importFormData.repeatedPassword"
            border-radius="mini"
          />
          <div class="wallet-import-hint">{{ t(`import.${SourceTypes.MnemonicSeed}.password.hint`) }}</div>
        </template>
        <s-select
          v-else
          :placeholder="t(`import.${SourceTypes.PolkadotJs}.selectAccount`)"
          v-model="selectedPolkadotJsAccount"
          border-radius="mini"
        >
          <s-option
            v-for="account in polkadotJsAccounts"
            :key="account.address"
            :value="account.address"
            :label="account.name"
          />
        </s-select>
      </template>
      <s-button
        type="primary"
        size="medium"
        :loading="loading"
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
import last from 'lodash/fp/last'

import TranslationMixin from './mixins/TranslationMixin'
import LoadingMixin from './mixins/LoadingMixin'
import WalletBase from './WalletBase.vue'
import WalletAccount from './WalletAccount.vue'
import { RouteNames, SourceTypes, PasswordConditions } from '../consts'
import { checkValidSeed } from '../api/account'

@Component({
  components: { WalletBase, WalletAccount }
})
export default class WalletImport extends Mixins(TranslationMixin, LoadingMixin) {
  readonly SourceTypes = SourceTypes
  readonly PasswordConditions = PasswordConditions

  @Action navigate
  @Action login
  @Action getAddress
  @Action importPolkadotJs
  @Action getPolkadotJsAccounts

  sourceType = SourceTypes.PolkadotJs
  polkadotJsAccounts: Array<{ address: string; name: string }> = []
  selectedPolkadotJsAccount: any = ''
  seed = ''
  step = 1
  importFormData = {
    name: '',
    password: '',
    repeatedPassword: ''
  }

  get disabled (): boolean {
    if (this.sourceType === SourceTypes.PolkadotJs) {
      return false
    }
    return this.step === 1
      ? !(this.seed && checkValidSeed(this.seed))
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
    const isInternalImport = [SourceTypes.MnemonicSeed, SourceTypes.RawSeed].includes(this.sourceType)
    try {
      await this.withApi(async () => {
        if (this.step === 1) {
          if (isInternalImport) {
            this.getAddress({ seed: this.seed })
          } else {
            this.polkadotJsAccounts = await this.getPolkadotJsAccounts()
            this.selectedPolkadotJsAccount = (last(this.polkadotJsAccounts) || {}).address
          }
        } else {
          if (isInternalImport) {
            const { name, password } = this.importFormData
            await this.login({ name, password, seed: this.seed })
          } else {
            await this.importPolkadotJs({ address: this.selectedPolkadotJsAccount })
          }
        }
      })
    } catch (error) {
      this.$alert(this.t((error as Error).message), this.t('errorText'))
      if (this.sourceType === SourceTypes.PolkadotJs && this.step === 2) {
        this.step = 1
      }
      return
    }
    if (this.step === 1) {
      this.step = 2
      return
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
