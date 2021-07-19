import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { Whitelist, Asset, AccountAsset, FPNumber, CodecString } from '@sora-substrate/util'
import NumberFormatterMixin from '@/components/mixins/NumberFormatterMixin'
import { BalanceTypes } from '@/types'

@Component
export default class FiatValueMixin extends Mixins(NumberFormatterMixin) {
  @Getter whitelist!: Whitelist

  getAssetFiatPrice (accountAsset: Asset | AccountAsset): CodecString | null {
    const asset = this.whitelist[accountAsset.address]
    return !asset || !asset.price ? null : asset.price
  }

  getFiatAmount (asset: AccountAsset, type: BalanceTypes): string | null {
    const price = this.getAssetFiatPrice(asset)
    if (!price) {
      return null
    }
    const balance: FPNumber = this.getFPNumberFromCodec(asset.balance[type || BalanceTypes.Transferable], asset.decimals)
    return balance.mul(FPNumber.fromCodecValue(price)).toString()
  }

  getFiatAmountByString (asset: AccountAsset, amount: string): string | null {
    if (amount === '') {
      return null
    }
    const price = this.getAssetFiatPrice(asset)
    if (!price) {
      return null
    }
    return this.getFPNumber(amount, asset.decimals).mul(FPNumber.fromCodecValue(price)).toString()
  }
}
