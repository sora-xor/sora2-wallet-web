import moment from 'moment'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
import { KnownAssets } from '@sora-substrate/util'

export const APP_NAME = 'SORA Wallet'

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

export const getAssetIconClasses = (address: string) => {
  const cssClass = 'asset-logo'
  if (!address) {
    return cssClass
  }
  const asset = KnownAssets.get(address)
  if (asset) {
    return `${cssClass} ${cssClass}--${asset.symbol.toLowerCase()}`
  }
  return cssClass
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS': return 'refresh'
    case 'ERROR': return 'circle-x'
    case 'SUCCESS': return 'check-mark'
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
