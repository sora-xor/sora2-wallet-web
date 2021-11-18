import { Mixins, Component } from 'vue-property-decorator';
import { FPNumber, Operation } from '@sora-substrate/util';
import NumberFormatterMixin from './NumberFormatterMixin';
import { NetworkFeeWarningOptions } from '@/consts';

@Component
export default class NetworkFeeWarningMixin extends Mixins(NumberFormatterMixin) {
  isXorSufficientForNextTx({
    type,
    isExternalTx = false,
    isXorAccountAsset,
    xorBalance,
    amount = '0',
    fee,
  }: NetworkFeeWarningOptions): boolean {
    if (type === Operation.EthBridgeIncoming || isExternalTx) return true;

    let fpRemainingBalance: FPNumber;
    const fpXorBalance = this.getFPNumberFromCodec(xorBalance);
    const fpAmount = this.getFPNumberFromCodec(amount);
    const fpNetworkFee = this.getFPNumberFromCodec(fee);

    if (type === Operation.Transfer || type === Operation.EthBridgeOutgoing) {
      if (isXorAccountAsset) {
        fpRemainingBalance = fpXorBalance.sub(fpAmount).sub(fpNetworkFee);
      } else {
        fpRemainingBalance = fpXorBalance.sub(fpNetworkFee);
      }

      return FPNumber.gte(fpRemainingBalance, fpNetworkFee);
    }

    if (type === Operation.CreatePair || type === Operation.AddLiquidity) {
      fpRemainingBalance = fpXorBalance.sub(fpAmount).sub(fpNetworkFee);

      return FPNumber.gte(fpRemainingBalance, fpNetworkFee);
    }

    if (type === Operation.RegisterAsset || type === Operation.RemoveLiquidity) {
      fpRemainingBalance = fpXorBalance.sub(fpNetworkFee);

      return FPNumber.gte(fpRemainingBalance, fpNetworkFee);
    }

    return true;
  }
}
