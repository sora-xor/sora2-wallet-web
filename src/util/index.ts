import moment from 'moment'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
import { FPNumber, KnownAssets, RewardInfo, RewardsInfo } from '@sora-substrate/util'

import { api } from '../api'
import store from '../store'
import { RewardsAmountHeaderItem } from '../types/rewards'

export const APP_NAME = 'Sora2 Wallet'

export const formatSoraAddress = (address: string) => api.formatAddress(address)

export const getExtension = async () => {
  let extensions: Array<any> = []
  try {
    extensions = await web3Enable(APP_NAME)
  } catch (error) {
    throw new Error('polkadotjs.noExtensions')
  }
  if (!extensions.length) {
    throw new Error('polkadotjs.noExtensions')
  }
  return extensions[0]
}

export const getExtensionInfo = async () => {
  const extension = await getExtension()
  const accounts = await extension.accounts.get() as Array<{ address: string; name: string }>
  if (!accounts.length) {
    throw new Error('polkadotjs.noAccounts')
  }
  return { accounts, signer: extension.signer }
}

export const getExtensionSigner = async (address: string) => {
  return (await web3FromAddress(address)).signer
}

/**
 * Returns block explorer link according to appropriate network type.
 * @param soraNetwork
 * Devnet will set by default
 */
export const getExplorerLink = (soraNetwork?: string) => {
  switch (soraNetwork) {
    case 'Testnet':
      return 'https://test.sorascan.com/sora-staging'
    case 'Mainnet':
      return 'https://sorascan.com/sora-mainnet'
    case 'Devnet':
    default:
      return 'https://explorer.s2.dev.sora2.soramitsu.co.jp/sora-dev'
  }
}

export const copyToClipboard = async (text: string) => {
  try {
    return navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Could not copy text: ', err)
  }
}

export const formatAddress = (address: string, length = address.length / 2): string => {
  return `${address.slice(0, length / 2)}...${address.slice(-length / 2)}`
}

export const formatDate = (date: number) => moment(date).format('DD.MM.YYYY, h:mm:ss')

export const getAssetIconStyles = (address: string) => {
  if (!address) {
    return {}
  }
  const asset = store.getters.whitelist[address]
  if (!asset) {
    return {}
  }
  return {
    'background-size': '100%',
    'background-image': `url("${asset.icon}")`
  }
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS': return 'refresh-16'
    case 'ERROR': return 'status-error-ic-16'
    case 'SUCCESS': return 'status-success-ic-16'
  }
  return ''
}

export const getStatusClass = (status: string) => {
  let state = ''
  switch (status) {
    case 'IN_PROGRESS':
      state = 'loading'
      break
    case 'ERROR':
      state = 'error'
      break
    case 'SUCCESS':
      state = 'success'
      break
  }
  return state ? `info-status info-status--${state}` : 'info-status'
}

export const delay = async (ms = 50) => {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export const toHashTable = (list: Array<any>, key: string) => {
  return list.reduce((result, item) => {
    if (!(key in item)) return result

    return { ...result, [item[key]]: item }
  }, {})
}

export const groupRewardsByAssetsList = (rewards: Array<RewardInfo | RewardsInfo>): Array<RewardsAmountHeaderItem> => {
  const rewardsHash = rewards.reduce((result, item) => {
    const isRewardsInfo = 'rewards' in item
    const { address, decimals } = isRewardsInfo ? (item as RewardsInfo).rewards[0].asset : (item as RewardInfo).asset
    const amount = isRewardsInfo ? (item as RewardsInfo).limit : (item as RewardInfo).amount
    const current = result[address] || new FPNumber(0, decimals)
    const addValue = FPNumber.fromCodecValue(amount, decimals)
    result[address] = current.add(addValue)
    return result
  }, {})

  return Object.entries(rewardsHash).reduce((total: Array<RewardsAmountHeaderItem>, [address, amount]) => {
    if ((amount as FPNumber).isZero()) return total

    const item = {
      symbol: KnownAssets.get(address).symbol,
      amount: (amount as FPNumber).toLocaleString()
    } as RewardsAmountHeaderItem

    total.push(item)

    return total
  }, [])
}
