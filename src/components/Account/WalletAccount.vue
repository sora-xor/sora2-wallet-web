<template>
  <account-card v-bind="$attrs">
    <template #avatar>
      <wallet-avatar slot="avatar" class="account-gravatar" :address="address" :size="28" />
    </template>
    <template #name>{{ name }}</template>
    <template #description>
      <formatted-address :value="address" :symbols="24" :tooltip-text="t('account.walletAddress')" />
    </template>
    <template #default>
      <s-tooltip
        v-if="withIdentity && identity"
        border-radius="mini"
        :content="t('addressBook.identity')"
        placement="top"
        tabindex="-1"
      >
        <div class="account-on-chain-name">{{ identity }}</div>
      </s-tooltip>
      <slot />
    </template>
  </account-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import { api } from '../../api';
import { ObjectInit } from '../../consts';
import { getter } from '../../store/decorators';
import { formatAccountAddress, getAccountIdentity } from '../../util';
import LoadingMixin from '../mixins/LoadingMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';

import AccountCard from './AccountCard.vue';
import WalletAvatar from './WalletAvatar.vue';

import type { PolkadotJsAccount } from '../../types/common';
import type { WithConnectionApi } from '@sora-substrate/util';

const DEFAULT_NAME = '<unknown>';

@Component({
  components: {
    AccountCard,
    WalletAvatar,
    FormattedAddress,
  },
})
export default class WalletAccount extends Mixins(TranslationMixin, LoadingMixin) {
  @Prop({ default: ObjectInit, type: Object }) readonly polkadotAccount!: PolkadotJsAccount;
  @Prop({ default: false, type: Boolean }) readonly withIdentity!: boolean;
  @Prop({ default: () => api, type: Object }) readonly chainApi!: WithConnectionApi;

  @getter.account.account private connected!: PolkadotJsAccount;

  accountIdentity = '';

  @Watch('address', { immediate: true })
  private async updateIdentity(value: string, oldValue: string) {
    if (!this.withIdentity || this.identity || value === oldValue) return;

    await this.withApi(async () => {
      this.accountIdentity = await getAccountIdentity(value, '', this.chainApi);
      this.$emit('identity', this.accountIdentity);
    });
  }

  get account(): PolkadotJsAccount {
    return this.polkadotAccount || this.connected;
  }

  get address(): string {
    return formatAccountAddress(this.account.address, true, this.chainApi);
  }

  get name(): string {
    return this.account.name || DEFAULT_NAME;
  }

  get identity(): string {
    return this.account.identity || this.accountIdentity;
  }
}
</script>

<style lang="scss">
.account-gravatar {
  border: 2px solid var(--s-color-base-border-secondary);
  border-radius: 50%;

  & > circle:first-child {
    fill: var(--s-color-utility-surface);
  }
}
</style>

<style scoped lang="scss">
.account-on-chain-name {
  max-width: 167px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  border-radius: calc(var(--s-border-radius-mini) / 2);
  padding: $inner-spacing-mini;
  background-color: var(--s-color-utility-surface);
  color: var(--s-color-base-content-secondary);
}
</style>
