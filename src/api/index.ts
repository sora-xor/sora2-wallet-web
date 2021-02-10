import axiosInstance from 'axios'
import { api, connection } from '@sora-substrate/util'

import { storage } from '../util/storage'

const axios = axiosInstance.create()
api.setStorage(storage)

export {
  axios,
  connection,
  api
}
