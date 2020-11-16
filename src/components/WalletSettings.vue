<template>
  <wallet-base :title="t('settings.title')" show-back @back="handleBack">
    <div class="wallet-settings">
      <s-select v-model="network">
        <s-option
          v-for="net in availableNetworks"
          :key="net.id"
          :value="net.id"
          :label="net.name"
        />
      </s-select>
      <div
        v-for="(item, index) in menuTabs"
        :key="index"
        @click="navigate({ name : item.route })"
      >
        <div class="wallet-settings-item s-flex">
          <div class="wallet-settings-item-text s-flex">
            <span class="wallet-settings-item-text_main">{{ item.title }}</span>
            <span class="wallet-settings-item-text_secondary">{{ item.desc }}</span>
          </div>
          <s-icon class="wallet-settings-item_icon" name="chevron-right" :size="16" />
        </div>
        <s-divider v-if="index !== menuTabs.length - 1" style="margin: unset" />
      </div>
      <div class="wallet-settings_action s-flex">
        <s-button
          type="secondary"
          size="small"
          @click="onLogout"
        >
          {{ t('logoutText') }}
        </s-button>
      </div>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames, SettingsMenu } from '../consts'
import { Network } from './settings/SettingsNetworks.vue'

interface MenuItem {
  title: string;
  desc: string;
  route: RouteNames;
}

@Component({
  components: {
    WalletBase
  }
})
export default class WalletSettings extends Mixins(TranslationMixin) {
  readonly RouteNames = RouteNames
  readonly SettingsMenu = SettingsMenu
  readonly menuTabs: MenuItem[] = [
    {
      title: this.t(`settings.menu.${this.SettingsMenu.Language}.title`),
      desc: this.t(`settings.menu.${this.SettingsMenu.Language}.desc`),
      route: this.RouteNames.WalletSettingsLanguage
    },
    {
      title: this.t(`settings.menu.${this.SettingsMenu.Networks}.title`),
      desc: this.t(`settings.menu.${this.SettingsMenu.Networks}.desc`),
      route: this.RouteNames.WalletSettingsNetworks
    },
    {
      title: this.t(`settings.menu.${this.SettingsMenu.About}.title`),
      desc: this.t(`settings.menu.${this.SettingsMenu.About}.desc`),
      route: this.RouteNames.WalletSettingsAbout
    }
  ]

  @State(state => state.Settings.activeNetwork) activeNetwork!: Network

  @Getter availableNetworks

  @Action navigate
  @Action logout
  @Action setActiveNetwork

  get network () {
    return this.activeNetwork.id
  }

  set network (id) {
    this.setActiveNetwork({ id })
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  onLogout (): void {
    this.navigate({ name: RouteNames.WalletConnection })
    this.logout()
  }
}
</script>

<style scoped lang="scss">
@import '../styles/typography';
@import '../styles/layout';
@import '../styles/soramitsu-variables';

.wallet-settings {
  &_action {
    justify-content: center;
  }
  &-item {
    justify-content: space-between;
    padding: $basic-spacing_small 0;
    &-text {
      flex-direction: column;

      &_main {
        font-size: $font-size_normal;
        line-height: 1.8;
      }
      &_secondary {
        font-size: $font-size_small;
        color: $s-color-base-content-tertiary;
        line-height: 1.8;
      }
    }

    &_icon {
      margin: auto 0;
    }

    &:hover {
      cursor: pointer;
      .wallet-settings-item-text_main {
        color: $s-color-button-tertiary-color;
      }
    }
  }
}
</style>
