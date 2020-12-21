import moment from 'moment'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

export const APP_NAME = 'Sora2 Wallet'

export const getExtensions = async () => {
  return await web3Enable(APP_NAME)
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

export const formatDate = (date: number) => moment(date).format('DD.MM.YYYY, h:mm:ss')

export const getAssetIconClasses = (symbol: string) => {
  const cssClass = 'asset-logo'
  if (symbol) {
    return `${cssClass} ${cssClass}--${symbol.toLowerCase()}`
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
