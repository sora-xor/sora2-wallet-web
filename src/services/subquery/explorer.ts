import { axiosInstance } from '@sora-substrate/util'

import { Explorer } from '../types'
import { HistoryElementsQuery } from './queries/historyElements'

export default class SubqueryExplorer implements Explorer {
  public static getApiUrl (soraNetwork?: string): string {
    switch (soraNetwork) {
      case 'Mainnet':
        return 'https://api.subquery.network/sq/sora-xor/sora'
      // TODO: subquery in progress
      case 'Devnet':
      case 'Testnet':
      default:
        return 'https://api.subquery.network/sq/sora-xor/sora-dev'
    }
  }

  public soraNetwork!: string

  public setSoraNetwork (soraNetwork: string): void {
    this.soraNetwork = soraNetwork
  }

  public async getAccountTransactions (params = {}): Promise<any> {
    try {
      const data = await this.request(HistoryElementsQuery, params)

      return data
    } catch (error) {
      console.error(error)
      return []
    }
  }

  public async getTransaction (hash: string): Promise<any> {
    // TODO: subquery in progress
    console.warn('SubqueryExplorer: "getTransaction" method is not implemented')
    return null
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
