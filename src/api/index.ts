import isEmpty from 'lodash/fp/isEmpty'
import { api, connection, FPNumber, axiosInstance } from '@sora-substrate/util'

import { storage } from '../util/storage'

api.setStorage(storage)

type FiatMappedTokens = {
  [key: string]: string;
}

async function getCeresTokensData (): Promise<FiatMappedTokens | null> {
  try {
    const cerestokenApi = await axiosInstance.get('https://cerestoken.io/api/pairs')
    const cerestokenApiObj = (cerestokenApi.data as Array<any>).reduce((acc, item) => {
      if (+item.price) {
        acc[item.asset_id] = new FPNumber(item.price).toCodecString()
      }
      return acc
    }, {})
    if (isEmpty(cerestokenApiObj)) {
      return null
    }
    return cerestokenApiObj as FiatMappedTokens
  } catch (error) {
    console.warn('CERES API not available!')
    return null
  }
}

export {
  connection,
  api,
  getCeresTokensData
}
