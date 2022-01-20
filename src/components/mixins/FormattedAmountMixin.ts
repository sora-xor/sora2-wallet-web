import { Component, Mixins } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { FPNumber, CodecString } from '@sora-substrate/util';
import { BalanceType, KnownAssets, KnownSymbols } from '@sora-substrate/util/build/assets/consts';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';

import NumberFormatterMixin from './NumberFormatterMixin';
import { FontSizeRate, FontWeightRate } from '../../consts';
import type { FiatPriceAndApyObject } from '../../services/types';

@Component
export default class FormattedAmountMixin extends Mixins(NumberFormatterMixin) {
  readonly FontSizeRate = FontSizeRate;
  readonly FontWeightRate = FontWeightRate;

  @Getter fiatPriceAndApyObject!: FiatPriceAndApyObject;

  getAssetFiatPrice(accountAsset: Asset | AccountAsset): Nullable<CodecString> {
    const fiatObj = this.fiatPriceAndApyObject[accountAsset.address];
    return !fiatObj || !fiatObj.price ? null : fiatObj.price;
  }

  getFiatBalance(asset: AccountAsset, type = BalanceType.Transferable): Nullable<string> {
    const price = this.getAssetFiatPrice(asset);
    if (!price || !asset.balance) {
      return null;
    }
    return this.getFPNumberFromCodec(asset.balance[type], asset.decimals)
      .mul(FPNumber.fromCodecValue(price))
      .toLocaleString();
  }

  getFiatAmount(amount: string | CodecString, asset: Asset | AccountAsset, isCodecString = false): Nullable<string> {
    // When input is empty, zero should be shown
    if (!amount && amount !== '') {
      return null;
    }
    const price = this.getAssetFiatPrice(asset);
    if (!price) {
      return null;
    }
    const { decimals } = asset;
    const amountParam = amount || '0';
    return (isCodecString ? this.getFPNumberFromCodec(amountParam, decimals) : this.getFPNumber(amountParam, decimals))
      .mul(FPNumber.fromCodecValue(price))
      .toLocaleString();
  }

  getFiatAmountByString(amount: string, asset: AccountAsset): Nullable<string> {
    // When input is empty, zero should be shown
    if (!amount && amount !== '') {
      return null;
    }
    const price = this.getAssetFiatPrice(asset);
    if (!price) {
      return null;
    }
    return this.getFPNumber(amount || '0', asset.decimals)
      .mul(FPNumber.fromCodecValue(price))
      .toLocaleString();
  }

  getFPNumberFiatAmountByFPNumber(amount: FPNumber, asset = KnownAssets.get(KnownSymbols.XOR)): Nullable<FPNumber> {
    const price = this.getAssetFiatPrice(asset);
    if (!price) {
      return null;
    }
    return amount.mul(FPNumber.fromCodecValue(price));
  }

  getFiatAmountByFPNumber(amount: FPNumber, asset = KnownAssets.get(KnownSymbols.XOR)): Nullable<string> {
    const price = this.getAssetFiatPrice(asset);
    if (!price) {
      return null;
    }
    return amount.mul(FPNumber.fromCodecValue(price)).toLocaleString();
  }

  getFiatAmountByCodecString(amount: CodecString, asset = KnownAssets.get(KnownSymbols.XOR)): Nullable<string> {
    return this.getFiatAmount(amount, asset, true);
  }
}
