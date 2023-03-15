<template>
  <div class="connection">
    <p class="connection__text">
      {{ t('connection.selectAccount') }}
    </p>

    <account-list @select="handleSelectAccount" class="connection__accounts">
      <account-card v-button @click.native="openWelcomePage">
        <template #avatar>
          <s-icon name="various-atom-24" size="32" />
        </template>
        <template #name>{{ t('desktop.addAccount') }}</template>
      </account-card>
    </account-list>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import TranslationMixin from '../../mixins/TranslationMixin';
import { LoginStep } from '../../../consts';
import { PolkadotJsAccount } from '../../../types/common';

import AccountList from '../AccountList.vue';
import AccountCard from '../../Account/AccountCard.vue';

@Component({
  components: { AccountList, AccountCard },
})
export default class ConnectedAccountList extends Mixins(TranslationMixin) {
  handleSelectAccount(account: PolkadotJsAccount): void {
    this.$emit('handleSelectAccount', account);
  }

  openWelcomePage(): void {
    this.$emit('stepChange', LoginStep.Welcome);
  }
}
</script>

<style scoped lang="scss">
.connection {
  &__accounts {
    margin-top: $basic-spacing-medium;
  }

  &__text {
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    color: var(--s-color-base-content-primary);
  }
}
</style>
