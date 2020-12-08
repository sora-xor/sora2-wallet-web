<template>
  <wallet-base :title="t('settings.title')" show-back @back="handleBack">
    <div class="wallet-settings">
      <s-select :value="activeNetwork.id" :placeholder="t('settings.network')" @change="id => setActiveNetwork({ id })">
        <s-option
          v-for="network in availableNetworks"
          :key="network.id"
          :value="network.id"
          :label="network.name"
        />
      </s-select>
      <div
        v-for="(item, index) in menuTabs"
        :key="index"
        @click="navigate({ name: item.route })"
      >
        <div class="wallet-settings-item s-flex">
          <div class="wallet-settings-item-text s-flex">
            <span class="wallet-settings-item-text_main">{{ item.title }}</span>
            <span class="wallet-settings-item-text_secondary">{{ item.desc }}</span>
          </div>
          <s-icon class="wallet-settings-item_icon" name="chevron-right" :size="16" />
        </div>
        <s-divider v-if="index !== menuTabs.length - 1" class="wallet-settings-item_divider" />
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
import { Network, RouteNames, SettingsMenu } from '../consts'

interface MenuItem {
  title: string;
  desc: string;
  route: RouteNames;
}

@Component({
  components: { WalletBase }
})
export default class WalletSettings extends Mixins(TranslationMixin) {
  readonly menuTabs: MenuItem[] = [
    {
      title: this.t(`settings.menu.${SettingsMenu.Language}.title`),
      desc: this.t(`settings.menu.${SettingsMenu.Language}.desc`),
      route: RouteNames.WalletSettingsLanguage
    },
    {
      title: this.t(`settings.menu.${SettingsMenu.Networks}.title`),
      desc: this.t(`settings.menu.${SettingsMenu.Networks}.desc`),
      route: RouteNames.WalletSettingsNetworks
    },
    {
      title: this.t(`settings.menu.${SettingsMenu.About}.title`),
      desc: this.t(`settings.menu.${SettingsMenu.About}.desc`),
      route: RouteNames.WalletSettingsAbout
    }
  ]

  @State(state => state.Settings.activeNetwork) activeNetwork!: Network

  @Getter availableNetworks!: Array<Network>

  @Action navigate
  @Action logout
  @Action setActiveNetwork

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
.wallet-settings {
  &_action {
    justify-content: center;
    > * {
      width: 100%;
    }
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
        color: var(--s-color-base-content-tertiary);
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
      .wallet-settings-item-text_main {
        color: var(--s-color-button-tertiary-color);
      }
    }
  }
}
</style>
