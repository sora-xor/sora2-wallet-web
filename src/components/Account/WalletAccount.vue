<template>
  <account-card v-bind="$attrs">
    <template #avatar>
      <wallet-avatar slot="avatar" class="account-gravatar" :address="address" :size="28" />
    </template>
    <template #name>
      <s-tooltip v-if="identityName" :content="name">
        <div class="identity">
          <div :class="['identity-status', { approved: isApproved }]">
            <s-icon :name="identityIcon" size="12" />
          </div>
          {{ identityName }}
        </div>
      </s-tooltip>
      <template v-else>
        {{ name }}
      </template>
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

  get identityName(): Nullable<string> {
    return this.identity?.name;
  }

  get identityIcon(): string {
    return this.isApproved ? 'basic-check-mark-24' : 'notifications-info-24';
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
.identity {
  display: flex;
  align-items: center;
  gap: $basic-spacing-mini;

  &-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: var(--s-color-status-info);

    &.approved {
      background-color: var(--s-color-status-success);
    }
  }
}
</style>
