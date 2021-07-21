import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { Whitelist, Asset, AccountAsset, KnownAssets, KnownSymbols, BalanceType, FPNumber, CodecString } from '@sora-substrate/util'

import NumberFormatterMixin from './NumberFormatterMixin'

@Component
export default class FiatValueMixin extends Mixins(NumberFormatterMixin) {
  @Getter whitelist!: Whitelist

  getAssetFiatPrice (accountAsset: Asset | AccountAsset): CodecString | null {
    const asset = this.whitelist[accountAsset.address]
    return !asset || !asset.price ? null : asset.price
  }

  getFiatBalance (asset: AccountAsset, type = BalanceType.Transferable): string | null {
    const price = this.getAssetFiatPrice(asset)
    if (!price || !asset.balance) {
      return null
    }
    return this.getFPNumberFromCodec(asset.balance[type], asset.decimals)
      .mul(FPNumber.fromCodecValue(price)).toString()
  }

  getFiatAmountByString (amount: string, asset: AccountAsset): string | null {
    if (!amount && amount !== '') {
      return null
    }
    const price = this.getAssetFiatPrice(asset)
    if (!price) {
      return null
    }
    return this.getFPNumber(amount || '0', asset.decimals).mul(FPNumber.fromCodecValue(price)).toString()
  }

  getFiatAmountByFPNumber (amount: FPNumber, asset = KnownAssets.get(KnownSymbols.XOR)): string | null {
    const price = this.getAssetFiatPrice(asset)
    if (!price) {
      return null
    }
    return amount.mul(FPNumber.fromCodecValue(price)).toString()
  }
}
