import { Component, Mixins } from 'vue-property-decorator'
import { History, TransactionStatus, Operation } from '@sora-substrate/util'
import findLast from 'lodash/fp/findLast'
import { Action } from 'vuex-class'

import { api } from '../../api'
import { delay, formatAddress } from '../../util'
import TranslationMixin from './TranslationMixin'
import LoadingMixin from './LoadingMixin'

@Component
export default class TransactionMixin extends Mixins(TranslationMixin, LoadingMixin) {
  private time = 0

  transaction: History | null = null // It's used just for sync errors

  @Action addActiveTransaction
  @Action removeActiveTransaction

  private getMessage (value?: History): string {
    if (!value || ![Operation.Transfer, Operation.RegisterAsset].includes(value.type)) {
      return ''
    }
    return this.t(`operations.${value.status}.${value.type}`, {
      amount: value.amount,
      symbol: value.symbol,
      address: value.to ? formatAddress(value.to as string, 20) : ''
    })
  }

  private async getLastTransaction (): Promise<void> {
    // Now we are checking every transaction with 1 second interval
    const tx = findLast(
      item => Math.abs(Number(item.startTime) - this.time) < 1000,
      api.accountHistory
    )
    if (!tx) {
      await delay()
      return await this.getLastTransaction()
    }
    this.transaction = tx
    this.addActiveTransaction({ tx: this.transaction })
  }

  /** Should be used with @Watch like a singletone in a root of the project */
  handleChangeTransaction (value: History): void {
    if (!value || !value.status || ![TransactionStatus.Finalized, TransactionStatus.Error].includes(value.status as any)) {
      return
    }
    const message = this.getMessage(value)
    if (value.status === TransactionStatus.Error) {
      this.$notify({
        message: message || this.t('unknownErrorText'),
        type: 'error',
        title: ''
      })
    } else if (value.status === TransactionStatus.Finalized) {
      this.$notify({
        message,
        type: 'success',
        title: ''
      })
    }
    this.time = 0
    this.removeActiveTransaction({ tx: value })
  }

  async withNotifications (func: () => Promise<void>): Promise<void> {
    await this.withLoading(async () => {
      try {
        this.time = Date.now()
        await func()
        await this.getLastTransaction()
        this.$notify({ message: this.t('transactionSubmittedText'), title: '' })
      } catch (error) {
        const message = this.getMessage(this.transaction as History)
        this.time = 0
        this.removeActiveTransaction({ tx: this.transaction })
        this.transaction = null
        this.$notify({
          message: message || this.t('unknownErrorText'),
          type: 'error',
          title: ''
        })
      }
    })
  }
}
