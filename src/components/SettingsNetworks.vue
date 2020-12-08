<template>
  <wallet-base :title="title" show-back @back="handleBack">
    <div class="wallet-settings-networks">
      <template v-if="step === 1">
        <span class="wallet-settings-networks_desc">{{ t('settings.networks.desc') }}</span>
        <div
          v-for="(net, index) in availableNetworks"
          :key="index"
          @click="openNetwork(net)"
        >
          <div class="wallet-settings-networks-item s-flex">
            <div class="wallet-settings-networks-item-text s-flex">
              <span class="wallet-settings-networks-item-text_main">{{ net.name }}</span>
            </div>
            <s-icon
              class="wallet-settings-networks-item_icon"
              name="chevron-right"
              :size="16"
            />
          </div>
          <s-divider v-if="index !== availableNetworks.length - 1" class="wallet-settings-networks-item_divider" />
        </div>
        <div class="wallet-settings-networks_action s-flex">
          <s-button
            type="secondary"
            size="small"
            @click="createNetwork"
          >
            {{ t('settings.networks.create') }}
          </s-button>
        </div>
      </template>
      <template v-else>
        <s-form
          :model="network"
          :disabled="!network.editable"
        >
          <s-form-item prop="name">
            <s-input v-model="network.name" :placeholder="t('settings.networks.form.name')" />
          </s-form-item>
          <s-form-item prop="address">
            <s-input v-model="network.address" :placeholder="t('settings.networks.form.address')" />
          </s-form-item>
          <s-form-item prop="explorer">
            <s-input v-model="network.explorer" :placeholder="t('settings.networks.form.explorer')" />
          </s-form-item>
        </s-form>
        <div class="wallet-settings-networks_action-group s-flex">
          <s-button
            type="secondary"
            size="small"
            @click="onCancel"
          >
            {{ t('cancelText')}}
          </s-button>
          <s-button
            :disabled="!network.editable"
            type="primary"
            size="small"
            @click="onSave"
          >
            {{ t('saveText') }}
          </s-button>
        </div>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter, State } from 'vuex-class'
import last from 'lodash/last'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { Network, RouteNames } from '../consts'

@Component({
  components: {
    WalletBase
  }
})
export default class SettingsNetworks extends Mixins(TranslationMixin) {
  @Getter availableNetworks

  @Action navigate
  @Action addNetwork

  step = 1
  network: Network = {
    id: 0,
    name: '',
    address: '',
    explorer: '',
    editable: false
  }

  get title (): string {
    if (this.step === 2) return this.network.name || this.t('settings.networks.customNetwork')
    return this.t('settings.menu.Networks.title')
  }

  openNetwork (net: Network): void {
    this.step = 2
    this.network = { ...net }
  }

  createNetwork (): void {
    const lastNetwork: Network | undefined = last(this.availableNetworks)
    const id = lastNetwork ? (lastNetwork.id + 1) : 1
    this.step = 2
    this.network = {
      id,
      name: '',
      address: '',
      explorer: '',
      editable: true
    }
  }

  onCancel (): void {
    this.step = 1
  }

  onSave (): void {
    this.addNetwork({ network: this.network })
    this.step = 1
  }

  handleBack (): void {
    if (this.step === 1) {
      this.navigate({ name: RouteNames.WalletSettings })
    } else {
      this.onCancel()
    }
  }
}
</script>

<style scoped lang="scss">
.wallet-settings-networks {
  &_desc {
    color: var(--s-color-base-content-tertiary);
    font-size: $font-size_small;
    padding: $basic-spacing_small 0;
  }
  &_action {
    justify-content: center;
    > * {
      width: 100%;
    }
  }
  &_action-group {
    & > button {
      width: 100%;
    }
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
      .wallet-settings-networks-item-text_main,
      .wallet-settings-networks-item_icon {
        color: var(--s-color-button-tertiary-color);
      }
    }
  }
}
</style>
