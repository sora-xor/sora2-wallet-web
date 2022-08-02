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
      <s-card
        v-if="isDesktop"
        shadow="always"
        size="small"
        border-radius="medium"
        class="logout"
        @click.native="openWelcomePage"
      >
        <div class="connection__logout">
          <s-icon name="various-atom-24" class="connection__logout-icon" size="28" />
          <div class="connection__logout-text s-flex">{{ t('desktop.addAccount') }}</div>
        </div>
      </s-card>
    </s-scrollbar>
  </div>
</template>

<script lang="ts">
import TranslationMixin from '@/components/mixins/TranslationMixin';
import { LoginStep } from '@/consts';
import { getter, state } from '../../../store/decorators';
import { PolkadotJsAccount } from '@/types/common';
import { Mixins, Component } from 'vue-property-decorator';

import WalletAccount from '../../WalletAccount.vue';

@Component({
  components: { WalletAccount },
})
export default class ConnectedAccountList extends Mixins(TranslationMixin) {
  @state.settings.isDesktop isDesktop!: boolean;
  @getter.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;

  handleClick(account: PolkadotJsAccount): void {
    this.$emit('handleSelectAccount', account);
  }

  openWelcomePage(): void {
    this.$emit('stepChange', LoginStep.Welcome);
  }
}
</script>

<style scoped lang="scss">
$account-height: 60px;
$account-margin-bottom: var(--s-basic-spacing);
$accounts-padding: calc(#{$account-margin-bottom} / 2);
$accounts-number: 7;

.logout {
  border: 1px solid transparent !important;
}
.logout:hover {
  border: 1px solid var(--s-color-base-content-tertiary) !important;
}

.connection {
  $avatar-margin-right: #{$basic-spacing-small};
  $avatar-size: var(--s-size-small);

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

  &__logout {
    display: flex;
    align-items: center;
    cursor: pointer;
    box-sizing: border-box !important;

    &-icon {
      margin-right: $avatar-margin-right;
      width: $avatar-size;
      height: $avatar-size;
      flex-shrink: 0;
      color: var(--s-color-base-content-tertiary) !important;
      border: 2px solid var(--s-color-base-border-secondary);
      border-radius: 50%;
      svg circle:first-child {
        fill: var(--s-color-utility-surface);
      }
    }

    &-text {
      font-size: var(--s-font-size-medium);
      font-weight: 600;
      line-height: var(--s-line-height-medium);
    }
  }
}
</style>
