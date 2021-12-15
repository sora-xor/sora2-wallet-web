import { Mixins, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { FPNumber, NetworkFeesObject, Operation } from '@sora-substrate/util';

import NumberFormatterMixin from './NumberFormatterMixin';
import { NetworkFeeWarningOptions } from '@/consts';

@Component
export default class NetworkFeeWarningMixin extends Mixins(NumberFormatterMixin) {
  @Getter networkFees!: NetworkFeesObject;

  isXorSufficientForNextTx({ type, isXorAccountAsset, xorBalance, amount }: NetworkFeeWarningOptions): boolean {
    const balanceIsEmpty = !xorBalance || !xorBalance.isFinity();

    if (type === Operation.EthBridgeIncoming || balanceIsEmpty) return true;

    let fpRemainingBalance: FPNumber;

    const networkFee = this.getFPNumberFromCodec(this.networkFees[type]);
    const fpAmount = amount || this.Zero;

    if ([Operation.Transfer, Operation.EthBridgeOutgoing].includes(type)) {
      if (isXorAccountAsset) {
        fpRemainingBalance = xorBalance.sub(fpAmount).sub(networkFee);
      } else {
        fpRemainingBalance = xorBalance.sub(networkFee);
      }

      return FPNumber.gte(fpRemainingBalance, networkFee);
    }

    if ([Operation.CreatePair, Operation.AddLiquidity].includes(type)) {
      fpRemainingBalance = xorBalance.sub(fpAmount).sub(networkFee);

      return FPNumber.gte(fpRemainingBalance, networkFee);
    }

    if ([Operation.RegisterAsset, Operation.RemoveLiquidity].includes(type)) {
      fpRemainingBalance = xorBalance.sub(networkFee);

      return FPNumber.gte(fpRemainingBalance, networkFee);
    }

    return true;
  }
}
