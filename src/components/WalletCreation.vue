<template>
  <wallet-base :title="t('creation.title')" show-back @back="handleBack">
    <div class="wallet-creation">
      <s-input :placeholder="t('creation.name.placeholder')" v-model="creationFormData.name" border-radius="mini" />
      <div class="wallet-creation-hint">{{ t('creation.name.hint') }}</div>
      <s-select :placeholder="t('creation.sourceType.placeholder')" :value="creationFormData.sourceType" border-radius="mini">
        <s-option
          :value="SourceTypes.MnemonicSeed"
          :label="t(`creation.sourceType.${SourceTypes.MnemonicSeed}`)"
        />
      </s-select>
      <div class="wallet-creation-hint">{{ t('creation.sourceType.hint') }}</div>
      <s-tooltip
        class="header-tooltip"
        popper-class="info-tooltip info-tooltip--header"
        :content="t('comingSoonText')"
        border-radius="mini"
        theme="light"
        placement="bottom-end"
        animation="none"
        :show-arrow="false"
      >
        <s-button
          type="primary"
          size="medium"
          @click="handleNext"
        >
          {{ t('creation.action') }}
        </s-button>
      </s-tooltip>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames, SourceTypes } from '../consts'

@Component({
  components: { WalletBase }
})
export default class WalletCreation extends Mixins(TranslationMixin) {
  readonly SourceTypes = SourceTypes

  @Action navigate

  creationFormData = {
    name: '',
    sourceType: SourceTypes.MnemonicSeed
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.WalletConnection })
  }

  handleNext (): void {
  }
}
</script>

<style lang="scss">
@include select-icon('wallet-creation');
</style>

<style scoped lang="scss">
.wallet-creation {
  &-hint {
    @include hint-text(true);
  }
  > button {
    width: 100%;
  }
  > :not(:last-child) {
    margin-bottom: $basic-spacing;
  }
}
</style>
