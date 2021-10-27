<template>
  <wallet-base
    :title="t('mst.title')"
    show-action
    :action-tooltip="t('mst.create.title')"
    action-icon="various-atom-24"
    @action="handleCreateMultisigAccount"
    show-back
    @back="handleBack"
  >
    <p class="multisig-text">{{ t('mst.selectAccount') }}</p>
    <s-scrollbar class="multisig-accounts">
      <div
        class="multisig-account"
        v-for="multisigAccount in multisigAccounts"
        :key="multisigAccount.address"
        @click="handleSelectAccount(multisigAccount)"
      >
        <!-- TODO 4 alexnatalia: Change the prop name and type to account -->
        <wallet-account :polkadotAccount="multisigAccount" is-multisig-account />
      </div>
    </s-scrollbar>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';
import TransactionMixin from './mixins/TransactionMixin';
import { RouteNames } from '../consts';

@Component({
  components: {
    WalletBase,
    WalletAccount,
  },
})
export default class MultisigAccount extends Mixins(TransactionMixin) {
  @Getter multisigAccounts!: Array<MultisigAccount>;
  @Getter currentMultisigAccount!: Nullable<MultisigAccount>;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action getMultisigAccounts!: AsyncVoidFn;
  @Action setCurrentMultisigAccount!: (
    multisigAccount: Nullable<MultisigAccount>
  ) => Promise<Nullable<MultisigAccount>>;

  async mounted(): Promise<void> {
    await this.getMultisigAccounts();
  }

  handleCreateMultisigAccount(): void {
    this.navigate({ name: RouteNames.CreateMultisigAccount });
  }

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }

  async handleSelectAccount(account: MultisigAccount): Promise<void> {
    if (this.currentMultisigAccount !== account) {
      await this.setCurrentMultisigAccount(account);
    }
    this.navigate({ name: RouteNames.Wallet });
  }
}
</script>

<style lang="scss">
.multisig {
  @include scrollbar($basic-spacing-big);
}
</style>

<style scoped lang="scss">
.multisig {
  @include account-list;
}
</style>
