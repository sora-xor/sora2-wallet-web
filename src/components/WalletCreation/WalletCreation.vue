<template>
  <wallet-base :title="t('creation.title')" show-back @back="handleBack">
    <div class="wallet-creation">
      <s-input :placeholder="t('creation.name.placeholder')" v-model="creationFormData.name" />
      <div class="wallet-creation-hint">{{ t('creation.name.hint') }}</div>
      <s-select :placeholder="t('creation.sourceType.placeholder')" :value="creationFormData.sourceType">
        <s-option
          :value="SourceTypes.MnemonicSeed"
          :label="t(`creation.sourceType.${SourceTypes.MnemonicSeed}`)"
        />
      </s-select>
      <div class="wallet-creation-hint">{{ t('creation.sourceType.hint') }}</div>
      <s-button
        type="primary"
        size="medium"
        :tooltip="t('comingSoonText')"
        @click="handleNext"
      >
        {{ t('creation.action') }}
      </s-button>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from '../mixins/TranslationMixin'
import WalletBase from '../WalletBase.vue'
import { RouteNames, SourceTypes } from '../../consts'

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

<style scoped lang="scss">
@import '../../styles/typography';
@import '../../styles/colors';
@import '../../styles/layout';

$font-size-hint: $font-size_small;

.wallet-creation {
  &-hint {
    color: $s-color-content-tertiary;
    font-size: $font-size-hint;
    line-height: 1.8;
  }
  > button {
    width: 100%;
  }
  > :not(:last-child) {
    margin-bottom: $basic-spacing;
  }
}

</style>
