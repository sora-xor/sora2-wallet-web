<template>
  <div class="connection">
    <p class="connection__text">
      {{ t('connection.selectAccount') }}
    </p>
    <s-scrollbar class="connection__accounts">
      <div
        class="connection__account"
        v-for="account in polkadotJsAccounts"
        :key="account.address"
        @click="handleClick(account)"
      >
        <wallet-account :polkadotAccount="account" />
      </div>
    </s-scrollbar>
  </div>
</template>

<script lang="ts">
import TranslationMixin from '@/components/mixins/TranslationMixin';
import { PolkadotJsAccount } from '@/types/common';
import { Mixins, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import WalletAccount from '../../WalletAccount.vue';

@Component({
  components: { WalletAccount },
})
export default class ConnectedAccountList extends Mixins(TranslationMixin) {
  @Getter polkadotJsAccounts!: Array<PolkadotJsAccount>;

  handleClick(account: PolkadotJsAccount): void {
    this.$emit('handleSelectAccount', account);
  }
}
</script>

<style scoped lang="scss">
$account-height: 60px;
$account-margin-bottom: var(--s-basic-spacing);
$accounts-padding: calc(#{$account-margin-bottom} / 2);
$accounts-number: 7;
.connection {
  &__accounts {
    margin-top: $basic-spacing-medium;
    height: calc(
      calc(#{$account-height} + #{$account-margin-bottom}) * #{$accounts-number} - #{$account-margin-bottom}
    );
  }

  &__account {
    height: $account-height;
    &:not(:last-child) {
      margin-bottom: var(--s-basic-spacing);
    }
    &:hover {
      cursor: pointer;
      .wallet-account {
        border-color: var(--s-color-base-content-secondary);
      }
    }
  }

  &__text {
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    color: var(--s-color-base-content-primary);
  }
}
</style>
