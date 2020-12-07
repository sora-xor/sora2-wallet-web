import axiosInstance from 'axios'
import { WalletApi } from '@sora-substrate/util'

import { storage } from '@/util/storage'

const axios = axiosInstance.create()
const walletApi = new WalletApi()
walletApi.setStorage(storage)

export {
  axios,
  walletApi
}
