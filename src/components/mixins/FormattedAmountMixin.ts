import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { Asset, AccountAsset, KnownAssets, KnownSymbols, BalanceType, FPNumber, CodecString } from '@sora-substrate/util'

import NumberFormatterMixin from './NumberFormatterMixin'
import { FiatPriceAndApyObject } from '../../services/types'

@Component
export default class FormattedAmountMixin extends Mixins(NumberFormatterMixin) {
  @Getter fiatPriceAndApyObject!: FiatPriceAndApyObject

  getAssetFiatPrice (accountAsset: Asset | AccountAsset): Nullable<CodecString> {
    const fiatObj = this.fiatPriceAndApyObject[accountAsset.address]
    return !fiatObj || !fiatObj.price ? null : fiatObj.price
  }

  getFiatBalance (asset: AccountAsset, type = BalanceType.Transferable): Nullable<string> {
    const price = this.getAssetFiatPrice(asset)
    if (!price || !asset.balance) {
      return null
    }
    return this.getFPNumberFromCodec(asset.balance[type], asset.decimals)
      .mul(FPNumber.fromCodecValue(price)).toLocaleString()
  }

  getFiatAmount (amount: string | CodecString, asset: Asset | AccountAsset, isCodecString = false): Nullable<string> {
    // When input is empty, zero should be shown
    if (!amount && amount !== '') {
      return null
    }
    const price = this.getAssetFiatPrice(asset)
    if (!price) {
      return null
    }
    const { decimals } = asset
    const amountParam = amount || '0'
    return (isCodecString ? this.getFPNumberFromCodec(amountParam, decimals) : this.getFPNumber(amountParam, decimals))
      .mul(FPNumber.fromCodecValue(price)).toLocaleString()
  }

  getFiatAmountByString (amount: string, asset: AccountAsset): Nullable<string> {
    // When input is empty, zero should be shown
    if (!amount && amount !== '') {
      return null
    }
    const price = this.getAssetFiatPrice(asset)
    if (!price) {
      return null
    }
    return this.getFPNumber(amount || '0', asset.decimals).mul(FPNumber.fromCodecValue(price)).toLocaleString()
  }

  getFPNumberFiatAmountByFPNumber (amount: FPNumber, asset = KnownAssets.get(KnownSymbols.XOR)): Nullable<FPNumber> {
    const price = this.getAssetFiatPrice(asset)
    if (!price) {
      return null
    }
    return amount.mul(FPNumber.fromCodecValue(price))
  }

  getFiatAmountByFPNumber (amount: FPNumber, asset = KnownAssets.get(KnownSymbols.XOR)): Nullable<string> {
    const price = this.getAssetFiatPrice(asset)
    if (!price) {
      return null
    }
    return amount.mul(FPNumber.fromCodecValue(price)).toLocaleString()
  }

  getFiatAmountByCodecString (amount: CodecString, asset = KnownAssets.get(KnownSymbols.XOR)): Nullable<string> {
    return this.getFiatAmount(amount, asset, true)
  }
}
