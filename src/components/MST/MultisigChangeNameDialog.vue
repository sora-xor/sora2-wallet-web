<template>
  <dialog-base :title="t('mst.settingsMst')" :visible.sync="isVisible" append-to-body>
    <div class="multisig-change-forget">
      <s-card v-bind="{ shadow: 'always', size: 'medium', borderRadius: 'small', ...$attrs }" class="switch-multisig">
        <div class="switcher">
          <s-switch v-model="isMSTLocal" @change="switchToFromMST" />
          <p>{{ t('mst.switchMst') }}</p>
        </div>
        <p>{{ t('mst.mstSwitchWarning') }}</p>
      </s-card>
      <s-input v-model="multisigNewName" :placeholder="t('mst.accountNameMst')" />
      <s-button :disabled="isNoNameOrTheSame" type="primary" @click="updateName">{{ t('mst.mstSave') }}</s-button>
      <s-button type="secondary" @click="forgetMultisig">{{ t('mst.mstForgetBtn') }}</s-button>
    </div>
    <mst-forget-dialog :visible.sync="dialogMSTNameChange" />
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';

import { api } from '../../api';
import { RouteNames } from '../../consts';
import { mutation, state, action, getter } from '../../store/decorators';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import NotificationMixin from '../mixins/NotificationMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import FormattedAddress from '../shared/FormattedAddress.vue';
import SimpleNotification from '../SimpleNotification.vue';

import MstForgetDialog from './MstForgetDialog.vue';

import type { Route } from '../../store/router/types';
import type { PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
    SimpleNotification,
    FormattedAddress,
    MstForgetDialog,
  },
})
export default class MultisigChangeNameDialog extends Mixins(TranslationMixin, NotificationMixin, DialogMixin) {
  @mutation.router.navigate private navigate!: (options: Route) => void;
  @mutation.account.syncWithStorage syncWithStorage!: () => void;
  @mutation.account.setIsMST setIsMST!: (isMST: boolean) => void;
  @action.account.afterLogin afterLogin!: () => void;
  @action.account.renameAccount public renameAccount!: (data: { address: string; name: string }) => Promise<void>;

  @state.account.isMST isMST!: boolean;

  @getter.account.account private account!: PolkadotJsAccount;

  dialogMSTNameChange = false;
  multisigNewName = '';
  currentName: string | null = null;
  isMSTLocal = false;

  async mounted() {
    this.isMSTLocal = this.isMSTAccount;
  }

  @Watch('isMSTAccount')
  onIsMSTAccountChanged(newVal: boolean) {
    this.isMSTLocal = newVal;
  }

  get isMSTAccount(): boolean {
    if (!this.isMST) return false;
    const mstName = api.mst.getMSTName();
    return mstName !== '';
  }

  get isNoNameOrTheSame(): boolean {
    return this.currentName === this.multisigNewName || this.multisigNewName === '';
  }

  switchToFromMST(): void {
    api.mst.switchAccount(this.isMSTLocal);
    this.setIsMST(this.isMSTLocal);
    this.syncWithStorage();
    this.afterLogin();
  }

  updateName(): void {
    api.mst.updateMultisigName(this.multisigNewName);
    const mstAddress = api.mst.getMstAddress();
    this.renameAccount({ address: mstAddress, name: this.multisigNewName });
    this.multisigNewName = '';
    this.closeDialog();
    this.navigate({ name: RouteNames.Wallet });
  }

  forgetMultisig(): void {
    this.closeDialog();
    this.dialogMSTNameChange = true;
  }
}
</script>

<style lang="scss" scoped>
.multisig-change-forget {
  display: flex;
  flex-direction: column;
  align-items: center;
  .switch-multisig {
    width: 100%;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    .switcher {
      display: flex;
      flex-direction: row;
      gap: 12px;
      margin-bottom: 12px;
    }
  }
  .el-button {
    width: 100%;
    font-size: 24px;
  }
  .el-button:first-of-type {
    margin-top: 24px;
    margin-bottom: 12px;
  }
}
</style>
