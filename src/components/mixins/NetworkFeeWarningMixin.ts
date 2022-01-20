import { Mixins, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { FPNumber, NetworkFeesObject, Operation, CodecString } from '@sora-substrate/util';
import { XOR } from '@sora-substrate/util/build/assets/consts';
import { api } from '../../api';

import NumberFormatterMixin from './NumberFormatterMixin';
import { NetworkFeeWarningOptions } from '@/consts';

@Component
export default class NetworkFeeWarningMixin extends Mixins(NumberFormatterMixin) {
  @Getter networkFees!: NetworkFeesObject;

  get xorBalance(): FPNumber {
    const accountXor = api.assets.accountAssets.find((asset) => asset.address === XOR.address);

    if (accountXor) {
      return this.getFPNumberFromCodec(accountXor.balance.transferable);
    }

    return this.Zero;
  }

  isXorSufficientForNextTx({ type, isXorAccountAsset, amount }: NetworkFeeWarningOptions): boolean {
    const balanceIsEmpty = !this.xorBalance || !this.xorBalance.isFinity();

    if (type === Operation.EthBridgeIncoming || balanceIsEmpty) return true;

    let fpRemainingBalance: FPNumber;

    const requiredFeeForNextTx =
      type === Operation.AddLiquidity ? this.networkFees.RemoveLiquidity : this.networkFees[type];
    const networkFee = this.getFPNumberFromCodec(requiredFeeForNextTx);
    const fpAmount = amount || this.Zero;

    if ([Operation.Transfer, Operation.EthBridgeOutgoing].includes(type)) {
      if (isXorAccountAsset) {
        fpRemainingBalance = this.xorBalance.sub(fpAmount).sub(networkFee);
      } else {
        fpRemainingBalance = this.xorBalance.sub(networkFee);
      }

      return FPNumber.gte(fpRemainingBalance, networkFee);
    }

    if ([Operation.CreatePair, Operation.AddLiquidity].includes(type)) {
      fpRemainingBalance = this.xorBalance.sub(fpAmount).sub(networkFee);

      return FPNumber.gte(fpRemainingBalance, networkFee);
    }

    if ([Operation.RegisterAsset, Operation.RemoveLiquidity].includes(type)) {
      fpRemainingBalance = this.xorBalance.sub(networkFee);

      return FPNumber.gte(fpRemainingBalance, networkFee);
    }

    return true;
  }
}
