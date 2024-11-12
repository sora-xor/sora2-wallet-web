<template>
  <account-card v-bind="$attrs">
    <template #avatar>
      <wallet-avatar slot="avatar" class="account-gravatar" :address="address" :size="28" />
    </template>
    <template #name>
      <identity v-if="identity" :identity="identity" :local-name="name" />
      <template v-else>{{ name }}</template>
    </template>
    <template #description>
      <formatted-address :value="address" :symbols="20" :tooltip-text="t('account.walletAddress')" />
    </template>
    <template #default>
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
import Identity from './Identity.vue';
import WalletAvatar from './WalletAvatar.vue';

import type { PolkadotJsAccount, AccountIdentity } from '../../types/common';
import type { WithConnectionApi } from '@sora-substrate/sdk';

const DEFAULT_NAME = '<unknown>';

@Component({
  components: {
    AccountCard,
    Identity,
    WalletAvatar,
    FormattedAddress,
  },
})
export default class WalletAccount extends Mixins(TranslationMixin, LoadingMixin) {
  @Prop({ default: ObjectInit, type: Object }) readonly polkadotAccount!: PolkadotJsAccount;
  @Prop({ default: false, type: Boolean }) readonly withIdentity!: boolean;
  @Prop({ default: () => api, type: Object }) readonly chainApi!: WithConnectionApi;

  @getter.account.account private connected!: PolkadotJsAccount;

  accountIdentity: Nullable<AccountIdentity> = null;

  @Watch('address', { immediate: true })
  private async updateIdentity(value: string, oldValue: string) {
    if (!this.withIdentity || value === oldValue) return;

    await this.withApi(async () => {
      this.accountIdentity = await getAccountIdentity(value, this.chainApi);
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

  get identity(): Nullable<AccountIdentity> {
    return this.account.identity ?? this.accountIdentity;
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
