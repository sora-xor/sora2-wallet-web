import axiosInstance from 'axios'
import { dexApi, connection } from '@sora-substrate/util'

import { storage } from '../util/storage'

const axios = axiosInstance.create()
dexApi.setStorage(storage)

export {
  axios,
  connection,
  dexApi
}
