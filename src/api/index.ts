import axiosInstance from 'axios'
import { DexApi } from '@sora-substrate/util'

import { storage } from '@/util/storage'

const axios = axiosInstance.create()
const dexApi = new DexApi()
dexApi.setStorage(storage)

export {
  axios,
  dexApi
}
