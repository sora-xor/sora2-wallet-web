<template>
  <wallet-base :title="t('settings.menu.About.title')" show-back @back="handleBack">
    <div class="wallet-settings-about">
      <span class="wallet-settings-about_desc">{{ appInfo }}</span>
      <div
        v-for="(link, index) in links"
        :key="index"
      >
        <div class="wallet-settings-about-item s-flex">
          <div class="wallet-settings-about-item-text s-flex">
            <a class="wallet-settings-about-item-text_main" :href="link.url" target="_blank">{{ link.title }}</a>
          </div>
          <s-icon
            class="wallet-settings-about-item_icon"
            name="external-link"
            :size="16"
          />
        </div>
        <s-divider v-if="index !== links.length - 1" class="wallet-settings-about-item_divider" />
      </div>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'

@Component({
  components: {
    WalletBase
  }
})
export default class SettingsAbout extends Mixins(TranslationMixin) {
  readonly links = [
    {
      title: this.t('settings.about.termsOfService'),
      url: this.t('settings.about.termsOfServiceLink')
    },
    {
      title: this.t('settings.about.privacyPolicy'),
      url: this.t('settings.about.privacyPolicyLink')
    }
  ]

  @Action navigate

  get appInfo (): string {
    const year = new Date().getFullYear()
    return `Sora Wallet ${year}`
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.WalletSettings })
  }
}
</script>

<style scoped lang="scss">
.wallet-settings-about {
  &_desc {
    color: var(--s-color-base-content-tertiary);
    font-size: $font-size_small;
    padding: $basic-spacing_small 0;
  }
  &-item {
    justify-content: space-between;
    padding: $basic-spacing_small 0;
    &-text {
      flex-direction: column;
      &_main {
        text-decoration: unset;
        color: unset;
        font-size: $font-size_normal;
        line-height: 1.8;
      }
    }
    &_icon {
      margin: auto 0;
    }
    &_divider {
      margin: unset;
    }
    &:hover {
      cursor: pointer;
      .wallet-settings-about-item-text_main,
      .wallet-settings-about-item_icon {
        color: var(--s-color-button-tertiary-color);
      }
    }
  }
}
</style>
