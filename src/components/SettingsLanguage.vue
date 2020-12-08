<template>
  <wallet-base :title="t('settings.menu.Language.title')" show-back @back="handleBack">
    <div class="wallet-settings-language">
      <div
        v-for="(locale, index) in sortedLocales"
        :key="index"
        @click="handleChangeLocale(locale)"
      >
        <div class="wallet-settings-language-item s-flex">
          <div class="wallet-settings-language-item-text s-flex">
            <span
              :class="[
                'wallet-settings-language-item-text_main',
                currentLocale === locale ? 'active' : ''
              ]"
            >
              {{ avaliableLocales[locale] }}
            </span>
            <span
              v-if="currentLocale !== locale"
              class="wallet-settings-language-item-text_secondary"
            >
              {{ t(`settings.language.${locale}`) }}
            </span>
          </div>
          <s-icon
            v-if="currentLocale === locale"
            class="wallet-settings-language-item_icon active"
            name="check-mark"
            :size="16"
          />
        </div>
        <s-divider v-if="index !== sortedLocales.length - 1" class="wallet-settings-language-item_divider" />
      </div>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'
import sortBy from 'lodash/fp/sortBy'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { Languages, RouteNames } from '../consts'

@Component({
  components: {
    WalletBase
  }
})
export default class SettingsLanguage extends Mixins(TranslationMixin) {
  @State(state => state.Settings.locales) locales!: Array<string>
  @State(state => state.Settings.locale) currentLocale!: string

  @Action navigate
  @Action setLocale

  get sortedLocales () {
    // Move currentLocale to the top
    return sortBy((lang) => lang === this.currentLocale ? 0 : 1, this.locales)
  }

  get avaliableLocales () {
    const locales = {}
    Object.values(Languages).forEach(lang => {
      locales[lang] = this.t(`settings.language.${lang}`)
    })
    return locales
  }

  handleChangeLocale (locale: string): void {
    if (locale === this.currentLocale) {
      return
    }
    this.setLocale({ locale })
    this.$root.$i18n.locale = locale
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.WalletSettings })
  }
}
</script>

<style scoped lang="scss">
.wallet-settings-language {
  &-item {
    justify-content: space-between;
    padding: $basic-spacing_small 0;
    &-text {
      flex-direction: column;
      &_main {
        font-size: $font-size_normal;
        line-height: $line-height_medium;
        &.active {
          color: var(--s-color-button-tertiary-color);
        }
      }
      &_secondary {
        font-size: $font-size_small;
        color: var(--s-color-base-content-tertiary);
        line-height: $line-height_medium;
      }
    }
    &_icon {
      margin: auto 0;
      &.active {
        color: var(--s-color-button-tertiary-color);
      }
    }
    &_divider {
      margin: unset;
    }
    &:hover {
      cursor: pointer;
      .wallet-settings-language-item-text_main {
        color: var(--s-color-button-tertiary-color);
      }
    }
  }
}
</style>
