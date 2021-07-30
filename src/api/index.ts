import axiosInstance from 'axios'
import { api, connection } from '@sora-substrate/util'

import { storage } from '../util/storage'

const axios = axiosInstance.create()
const { origin, pathname } = window.location
const baseUrl = `${origin}${pathname}`

axios.defaults.headers.common['Cache-Control'] = 'no-cache'
axios.defaults.baseURL = baseUrl

api.setStorage(storage)

export {
  axios,
  connection,
  api
}
