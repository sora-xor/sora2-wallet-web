import axiosInstance from 'axios'
import isEmpty from 'lodash/fp/isEmpty'
import { api, connection, FPNumber } from '@sora-substrate/util'

import { storage } from '../util/storage'

const axios = axiosInstance.create()
const { origin, pathname } = window.location
const baseUrl = `${origin}${pathname}`

axios.defaults.headers.common['Cache-Control'] = 'no-cache'
axios.defaults.baseURL = baseUrl

api.setStorage(storage)

type FiatMappedTokens = {
  [key: string]: string;
}

async function getCeresTokensData (): Promise<FiatMappedTokens | null> {
  try {
    const cerestokenApi = await axios.get('https://cerestoken.io/api/pairs')
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
  axios,
  connection,
  api,
  getCeresTokensData
}
