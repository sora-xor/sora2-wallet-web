import { axiosInstance } from '@sora-substrate/util'

import { Explorer } from '../types'
import { HistoryElementsQuery } from './queries/historyElements'

import store from '../../store'

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

  public async request (scheme: any, params = {}): Promise<any> {
    const url = SubqueryExplorer.getApiUrl(this.soraNetwork)
    const response = await axiosInstance.post(url, {
      query: scheme,
      variables: params
    })

    return response.data.data
  }
}
