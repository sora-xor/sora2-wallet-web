import { Mixins, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { FPNumber, NetworkFeesObject, Operation } from '@sora-substrate/util';
import { XOR } from '@sora-substrate/util/build/assets/consts';

import NumberFormatterMixin from './NumberFormatterMixin';
import { NetworkFeeWarningOptions } from '@/consts';

import type { AccountAssetsTable } from '@/types/common';

@Component
export default class NetworkFeeWarningMixin extends Mixins(NumberFormatterMixin) {
  @Getter networkFees!: NetworkFeesObject;
  @Getter accountAssetsAddressTable!: AccountAssetsTable;

  get xorBalance(): FPNumber {
    const accountXor = this.accountAssetsAddressTable[XOR.address];

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
