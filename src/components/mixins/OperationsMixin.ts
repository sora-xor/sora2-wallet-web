import { Component, Mixins } from 'vue-property-decorator';
import { History, TransactionStatus, Operation } from '@sora-substrate/util';

import TranslationMixin from './TranslationMixin';
import NumberFormatterMixin from './NumberFormatterMixin';

import { HiddenValue } from '../../consts';
import { formatAddress, groupRewardsByAssetsList } from '../../util';
import { getter } from '../../store/decorators';

import type { PolkadotJsAccount } from '../../types/common';

const twoAssetsBasedOperations = [
  Operation.AddLiquidity,
  Operation.CreatePair,
  Operation.RemoveLiquidity,
  Operation.Swap,
  Operation.SwapAndSend,
  Operation.DemeterFarmingDepositLiquidity,
  Operation.DemeterFarmingWithdrawLiquidity,
];

const accountIdBasedOperations = [Operation.SwapAndSend, Operation.Transfer];

@Component
export default class OperationsMixin extends Mixins(TranslationMixin, NumberFormatterMixin) {
  @getter.account.account account!: PolkadotJsAccount;

  getTitle(value?: History): string {
    if (!value || !Object.values(Operation).includes(value.type as Operation)) {
      return '';
    }
    const params = { ...value } as any;

    if (value.type === Operation.ReferralSetInvitedUser) {
      const isInvitedUser = this.account.address === value.from;
      const linkedRole = isInvitedUser ? 'transaction.referrer' : 'transaction.referral';
      params.role = this.t(linkedRole);
    }

    return this.t(`operations.${value.type}`, params);
  }

  getMessage(value?: History, hideAmountValues = false): string {
    if (!value || !Object.values(Operation).includes(value.type as Operation)) {
      return '';
    }
    const params = { ...value } as any;
    if (accountIdBasedOperations.includes(value.type)) {
      const isRecipient = this.account.address === value.to;
      const address = isRecipient ? value.from : value.to;
      const direction = isRecipient ? this.t('transaction.from') : this.t('transaction.to');
      const action = isRecipient ? this.t('receivedText') : this.t('sentText');

      params.address = formatAddress(address as string, 10);
      params.direction = direction;
      params.action = action;
    }
    if (
      [
        ...twoAssetsBasedOperations,
        Operation.Transfer,
        Operation.DemeterFarmingGetRewards,
        Operation.DemeterFarmingStakeToken,
        Operation.DemeterFarmingUnstakeToken,
        Operation.EthBridgeIncoming,
        Operation.EthBridgeOutgoing,
      ].includes(value.type)
    ) {
      params.amount = params.amount ? this.formatStringValue(params.amount, params.decimals) : '';
    }
    if (twoAssetsBasedOperations.includes(value.type)) {
      params.amount2 = params.amount2 ? this.formatStringValue(params.amount2, params.decimals2) : '';
    }
    if (value.type === Operation.ClaimRewards) {
      params.rewards = groupRewardsByAssetsList(params.rewards)
        .map(({ amount, asset }) => {
          return `${hideAmountValues ? HiddenValue : this.formatStringValue(amount)} ${asset.symbol}`;
        })
        .join(` ${this.t('operations.andText')} `);
    }
    if (value.type === Operation.ReferralSetInvitedUser) {
      const isInvitedUser = this.account.address === value.from;
      const linkedAddress = (isInvitedUser ? value.to : value.from) as string;
      const linkedRole = isInvitedUser ? 'transaction.referrer' : 'transaction.referral';
      params.role = this.t(linkedRole);
      params.address = formatAddress(linkedAddress, 10);
    }
    let status = value.status as TransactionStatus;
    if ([TransactionStatus.Invalid, TransactionStatus.Usurped].includes(status)) {
      status = TransactionStatus.Error;
    } else if (status !== TransactionStatus.Error) {
      status = TransactionStatus.Finalized;
    }
    if (hideAmountValues) {
      params.amount = HiddenValue;
      params.amount2 = HiddenValue;
    }
    return this.t(`operations.${status}.${value.type}`, params);
  }
}
