<template>
  <wallet-base :title="t('settings.menu.Language.title')" show-back @back="handleBack">
    <div class="wallet-settings-language">
      <div
        v-for="(locale, index) in locales"
        :key="index"
        @click="setLocale({ locale })"
      >
        <div class="wallet-settings-language-item s-flex">
          <div class="wallet-settings-language-item-text s-flex">
            <span
              :class="[
                'wallet-settings-language-item-text_main',
                currentLocale === locale ? 'active' : ''
              ]"
            >{{ avaliableLocales[locale] }}</span>
            <span
              v-if="currentLocale !== locale"
              class="wallet-settings-language-item-text_secondary"
            > {{ t(`settings.language.${locale}`) }}</span>
          </div>
          <s-icon
            v-if="currentLocale === locale"
            class="wallet-settings-language-item_icon active"
            name="check-mark"
            :size="16"
          />
        </div>
        <s-divider v-if="index !== locales.length - 1" style="margin: unset" />
      </div>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import TranslationMixin from '../mixins/TranslationMixin'
import WalletBase from '../WalletBase.vue'
import { Languages, RouteNames } from '../../consts'

@Component({
  components: {
    WalletBase
  }
})
export default class SettingsLanguage extends Mixins(TranslationMixin) {
  @State(state => state.Settings.locales) locales
  @State(state => state.Settings.locale) currentLocale

  @Action navigate
  @Action setLocale

  get avaliableLocales () {
    return {
      [Languages.EN]: 'English'
    }
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.WalletSettings })
  }
}
</script>

<style scoped lang="scss">
@import '../../styles/typography';
@import '../../styles/layout';
@import '../../styles/soramitsu-variables';

.wallet-settings-language {
  &-item {
    justify-content: space-between;
    padding: $basic-spacing_small 0;
    &-text {
      flex-direction: column;

      &_main {
        font-size: $font-size_normal;
        line-height: 1.8;
        &.active {
          color: $s-color-button-tertiary-color;
        }
      }
      &_secondary {
        font-size: $font-size_small;
        color: $s-color-base-content-tertiary;
        line-height: 1.8;
      }
    }

    &_icon {
      margin: auto 0;

      &.active {
        color: $s-color-button-tertiary-color;
      }
    }

    &:hover {
      cursor: pointer;
      .wallet-settings-language-item-text_main {
        color: $s-color-button-tertiary-color;
      }
    }
  }
}
</style>
