import { axiosInstance, FPNumber, KnownAssets, KnownSymbols } from '@sora-substrate/util'

import { HistoryElementsQuery } from './queries/historyElements'
import type { Explorer, PoolXYKEntity, FiatPriceAndApyObject } from '../types'

import store from '../../store'
import { FiatPriceQuery } from './queries/fiatPriceAndApy'

export default class SubqueryExplorer implements Explorer {
  // TODO: add api link for wss://ws.tst.sora2.soramitsu.co.jp?
  public static getApiUrl (soraNetwork?: string): string {
    switch (soraNetwork) {
      case 'Mainnet':
        return 'https://api.subquery.network/sq/sora-xor/sora'
      case 'Testnet':
        return 'https://api.subquery.network/sq/sora-xor/sora-staging'
      case 'Devnet':
      default:
        return 'https://subquery.q1.dev.sora2.soramitsu.co.jp/'
    }
  }

  public get soraNetwork (): string {
    return store.getters.soraNetwork
  }

  public async getAccountTransactions (params = {}): Promise<any> {
    const { historyElements } = await this.request(HistoryElementsQuery, params)

    return historyElements
  }

  /**
   * Get fiat price & APY coefficient for each asset (without historical data)
   */
  public async getFiatPriceAndApyObject (): Promise<Nullable<FiatPriceAndApyObject>> {
    try {
      const { poolXYKEntities } = await this.request(FiatPriceQuery)
      if (!poolXYKEntities) {
        return null
      }
      const xorAddress = KnownAssets.get(KnownSymbols.XOR).address
      const daiAddress = '0x0200060000000000000000000000000000000000000000000000000000000000' // TODO: move it to substrate-js
      const data = (poolXYKEntities.nodes[0].pools.edges as Array<any>).reduce((acc, item) => {
        const el: PoolXYKEntity = item.node
        const apy = new FPNumber(+el.apy).toCodecString()
        const price = new FPNumber(+el.priceUSD).toCodecString()
        acc[el.targetAssetId] = { apy, price }
        if (el.targetAssetId === daiAddress) {
          const xorReserve = new FPNumber(+el.baseAssetReserves)
          const daiReserve = new FPNumber(+el.targetAssetReserves)
          const xorPrice = daiReserve.div(xorReserve).toCodecString()
          acc[xorAddress] = { price: xorPrice }
        }
        return acc
      }, {})
      return data
    } catch (error) {
      console.error('Subquery is not available or data is incorrect!', error)
      return null
    }
  }

  public async request (scheme: any, params = {}): Promise<any> {
    const url = SubqueryExplorer.getApiUrl(this.soraNetwork)
    const response = await axiosInstance.post(url, {
      query: scheme,
      variables: params
    })

    return response.data.data
  }
}
