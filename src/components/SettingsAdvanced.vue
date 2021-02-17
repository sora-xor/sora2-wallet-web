<template>
  <wallet-base :title="t('settings.menu.Advanced.title')" show-back @back="handleBack">
    <div class="wallet-settings-advanced">
      <div
        v-for="(item, index) in menuTabs"
        :key="index"
        @click="navigate({ name: item.route })"
      >
        <div class="wallet-settings-advanced-item s-flex">
          <div class="wallet-settings-advanced-item-text s-flex">
            <span class="wallet-settings-advanced-item-text_main">{{ item.title }}</span>
            <span class="wallet-settings-advanced-item-text_secondary">{{ item.desc }}</span>
          </div>
          <s-icon class="wallet-settings-advanced-item_icon" name="chevron-right" size="12px" />
        </div>
        <s-divider v-if="index !== menuTabs.length - 1" class="wallet-settings-advanced-item_divider" />
      </div>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames, SettingsMenuItem } from '../consts'

@Component({
  components: {
    WalletBase
  }
})
export default class SettingsAdvanced extends Mixins(TranslationMixin) {
  readonly menuTabs: SettingsMenuItem[] = [
    {
      title: 'Create token',
      desc: 'Create and deploy custom token on SORA',
      route: RouteNames.CreateToken
    }
  ]

  @Action navigate

  handleBack (): void {
    this.navigate({ name: RouteNames.WalletSettings })
  }
}
</script>

<style lang="scss">
@include select-icon('wallet-settings');
</style>s

<style scoped lang="scss">
.wallet-settings-advanced {
  &-item {
    justify-content: space-between;
    padding: $basic-spacing_small 0;
    &-text {
      flex-direction: column;
      &_main {
        font-size: $font-size_normal;
        line-height: $line-height_medium;
      }
      &_secondary {
        @include hint-text(true);
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
  @include icon-chevron-right;
}
</style>
