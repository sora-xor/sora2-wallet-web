import { Vue, Component } from 'vue-property-decorator';

import { delay } from '../../util';

@Component
export default class ConfirmTransactionMixin extends Vue {
  showConfirmTxDialog = false;
  isTxDialogConfirmed = false;

  confirmTransactionDialog(): void {
    this.isTxDialogConfirmed = true;
    this.showConfirmTxDialog = false;
  }

  openConfirmationDialog(): void {
    this.isTxDialogConfirmed = false;
    this.showConfirmTxDialog = true;
  }

  async waitOnNextTxConfirmation(ms = 500): Promise<void> {
    if (!this.showConfirmTxDialog) return;

    await delay(ms);
    return await this.waitOnNextTxConfirmation();
  }
}
