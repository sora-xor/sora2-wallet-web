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

async function getSubqueryTokensData (): Promise<FiatMappedTokens | null> {
  try {
    const subqueryApi = await axios({
      method: 'post',
      url: 'https://api.subquery.network/sq/sora-xor/sora-dev',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      // TODO: Check why array of pools has no XOR asset
      data: {
        query: `query {
            poolXYKEntities (last: 1) {
              nodes {
                pools {
                  edges {
                    node {
                      targetAssetId,
                      priceUSD
                    }
                  }
                }
              }
            }
          }`,
        variables: null
      }
    })
    const subqueryApiTokens = (subqueryApi.data?.data?.poolXYKEntities?.nodes[0]?.pools?.edges as Array<any>).reduce((acc, itemNode) => {
      const item = itemNode.node
      // TODO: Could we show zero price?
      // if (+item.priceUSD) {
      acc[item.targetAssetId] = new FPNumber(item.priceUSD).toCodecString()
      // }
      return acc
    }, {})
    if (isEmpty(subqueryApiTokens)) {
      // TODO: This line is for dev only
      console.log('subqueryApiTokens is empty')
      return null
    }
    // TODO: This line is for dev only
    console.log('subqueryApiTokens: ', subqueryApiTokens)
    return subqueryApiTokens as FiatMappedTokens
  } catch (error) {
    console.error(error)
    console.warn('SubQuery API not available!')
    return null
  }
}

export {
  axios,
  connection,
  api,
  getSubqueryTokensData
}
