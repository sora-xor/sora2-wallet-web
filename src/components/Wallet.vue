<template>
  <wallet-base :title="t('wallet.title')" show-settings>
    <wallet-account show-menu :name="account.name" />
    <div class="wallet">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab
          v-for="tab in WalletTabs"
          :key="tab"
          :label="t(`wallet.${tab}`)"
          :name="tab"
        />
      </s-tabs>
      <component :is="currentTab" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import WalletAccount from './WalletAccount.vue'
import WalletAssets from './WalletAssets.vue'
import WalletActivity from './WalletActivity.vue'
import { WalletTabs } from '../consts'

@Component({
  components: {
    WalletBase,
    WalletAccount,
    WalletAssets,
    WalletActivity
  }
})
export default class Wallet extends Mixins(TranslationMixin) {
  readonly WalletTabs = WalletTabs

  @Getter account!: any
  @Action navigate

  currentTab = WalletTabs.Assets

  handleChangeTab (value: WalletTabs): void {
    this.currentTab = value
  }
}
</script>

<style lang="scss">
@import '../styles/layout';
@import '../styles/soramitsu-variables';

$tabs-class: ".el-tabs";
$tabs-container-height: $basic-spacing * 4;
$tabs-container-padding: 2px;
$tabs-item-height: $tabs-container-height - $tabs-container-padding * 2;

.wallet {
  .s-tabs {
    &#{$tabs-class} {
      #{$tabs-class}__header {
        width: 100%;
      }
    }
    #{$tabs-class} {
      &__header {
        #{$tabs-class}__nav-wrap #{$tabs-class}__item {
          padding-right: $basic-spacing;
          padding-left: $basic-spacing;
          &.is-active {
            margin: 0;
            box-shadow: $s-shadow-tab;
            &:hover {
              box-shadow: none;
            }
          }
          &,
          &.is-active,
          &.is-focus {
            border-radius: $border-radius_small;
          }
        }
        #{$tabs-class}__item {
          height: $tabs-item-height;
          line-height: $tabs-item-height;
          &:hover {
            background-color: $s-color-base-background-hover;
          }
        }
      }
      &__nav-wrap {
        height: $tabs-container-height;
        padding: $tabs-container-padding;
        background-color: $s-color-base-background;
        border-radius: $border-radius_small;
      }
    }
  }
  #{$tabs-class} {
    &__header {
      margin-bottom: $basic-spacing_mini;
    }
    &__nav {
      width: 100%;
    }
    &__item {
      width: 50%;
      text-align: center;
    }
  }
}
</style>

<style scoped lang="scss">
@import '../styles/layout';

.wallet {
  margin-top: $basic-spacing;
}
</style>
