import { Mixins, Component } from 'vue-property-decorator';
import { FPNumber, Operation } from '@sora-substrate/util';
import NumberFormatterMixin from './NumberFormatterMixin';
import { NetworkFeeWarningOptions } from '@/consts';

@Component
export default class NetworkFeeWarningMixin extends Mixins(NumberFormatterMixin) {
  isXorSufficientForNextTx({
    type,
    isXorAccountAsset,
    xorBalance,
    amount = '0',
    fee,
  }: NetworkFeeWarningOptions): boolean {
    if (type === Operation.EthBridgeIncoming || !xorBalance) return true;

    let fpRemainingBalance: FPNumber;
    const fpXorBalance = this.getFPNumberFromCodec(xorBalance);
    const fpAmount = this.getFPNumberFromCodec(amount);
    const fpNetworkFee = this.getFPNumberFromCodec(fee);

    if ([Operation.Transfer, Operation.EthBridgeOutgoing].includes(type)) {
      if (isXorAccountAsset) {
        fpRemainingBalance = fpXorBalance.sub(fpAmount).sub(fpNetworkFee);
      } else {
        fpRemainingBalance = fpXorBalance.sub(fpNetworkFee);
      }

      return FPNumber.gte(fpRemainingBalance, fpNetworkFee);
    }

    if ([Operation.CreatePair, Operation.AddLiquidity].includes(type)) {
      fpRemainingBalance = fpXorBalance.sub(fpAmount).sub(fpNetworkFee);

      return FPNumber.gte(fpRemainingBalance, fpNetworkFee);
    }

    if ([Operation.RegisterAsset, Operation.RemoveLiquidity].includes(type)) {
      fpRemainingBalance = fpXorBalance.sub(fpNetworkFee);

      return FPNumber.gte(fpRemainingBalance, fpNetworkFee);
    }

    return true;
  }
}
