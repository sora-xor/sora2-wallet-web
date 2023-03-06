<template>
  <div class="connection">
    <p v-if="text" class="connection__text">
      {{ text }}
    </p>

    <account-list @select="handleSelectAccount" class="connection__accounts">
      <account-card class="connection__button" v-button @click.native="handleCreateAccount">
        <template #avatar>
          <s-icon name="basic-circle-plus-24" size="32" />
        </template>
        <template #name>{{ t('desktop.button.createAccount') }}</template>
      </account-card>
      <account-card class="connection__button" v-button @click.native="handleImportAccount">
        <template #avatar>
          <s-icon name="basic-download-bold-24" size="32" />
        </template>
        <template #name>{{ t('desktop.button.importAccount') }}</template>
      </account-card>
    </account-list>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';

import TranslationMixin from '../../mixins/TranslationMixin';

import AccountList from '../AccountList.vue';
import AccountCard from '../../Account/AccountCard.vue';

import type { PolkadotJsAccount } from '../../../types/common';

@Component({
  components: { AccountList, AccountCard },
})
export default class ExternalAccountList extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly text!: string;

  handleSelectAccount(account: PolkadotJsAccount): void {
    this.$emit('select', account);
  }

  handleCreateAccount(): void {
    this.$emit('create');
  }

  handleImportAccount(): void {
    this.$emit('import');
  }
}
</script>

<style scoped lang="scss">
.connection {
  & > * {
    &:not(:last-child) {
      margin-bottom: $basic-spacing-medium;
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
