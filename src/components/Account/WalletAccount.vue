<template>
  <account-card v-bind="$attrs">
    <template #avatar>
      <wallet-avatar slot="avatar" class="account-gravatar" :address="address" :size="28" />
    </template>
    <template #name>
      {{ displayName }}
      <s-icon v-if="isApproved" name="basic-check-mark-24" class="account-checkmark" />
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
import WalletAvatar from './WalletAvatar.vue';

import type { PolkadotJsAccount, AccountIdentity } from '../../types/common';
import type { WithConnectionApi } from '@sora-substrate/sdk';

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

  accountIdentity: Nullable<AccountIdentity> = null;

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

  get identity(): Nullable<AccountIdentity> {
    return this.account.identity ?? this.accountIdentity;
  }

  get displayName(): string {
    return this.identity?.name || this.name;
  }

  get isApproved(): boolean {
    return !!this.identity?.approved;
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
.account-checkmark {
  color: var(--s-color-status-success);
}
</style>
