import { api } from '../api'

export const checkValidSeed = (seed: string) => {
  try {
    return !!api.checkSeed(seed).address
  } catch (error) {
    return false
  }
}

// TODO: remove these mock data and add real integration
const addressMock = '5HVmWWpBi69cmmDGdfgg53dfgxxJ2pveRnfozNg5K'
const nameMock = 'Mock'
const assetsMock = [{
  name: 'Sora',
  symbol: 'XOR',
  address: '1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  amount: 12787.09,
  usdAmount: 6345.23
},
{
  name: 'Kusama',
  symbol: 'KSM',
  address: '34916349d43f65bccca11ff53a8e0382a1a594a7',
  amount: 127.05,
  usdAmount: 634.25
},
{
  name: 'Etherium',
  symbol: 'ETH',
  address: '8adaca8ea8192656a15c88797e04c8771c4576b3',
  amount: 3.32,
  usdAmount: 235.23
}]
const assetDetailsMock = {
  XOR: [
    // { id: 1, operation: 'SWAP', fromAmount: 100, toSymbol: 'KSM', toAmount: 24390.1239, status: 'IN_PROGRESS', date: Date.now() - 3600 },
    // { id: 2, operation: 'SWAP', fromAmount: 100, toSymbol: 'KSM', toAmount: 24390.1239, status: 'ERROR', date: Date.now() - 3600 },
    // { id: 3, operation: 'SWAP', fromAmount: 100, toSymbol: 'KSM', toAmount: 24390.1239, status: 'SUCCESS', date: Date.now() - 3600 }
  ],
  ETH: [
    // { id: 4, operation: 'SWAP', fromAmount: 2.2, toSymbol: 'KSM', toAmount: 2439.1239, status: 'SUCCESS', date: Date.now() - 7200 }
  ],
  KSM: []
}
const transactionMock = {
  id: 1,
  hash: '5HVmWWpBi69cmmDf4RlKaSqWxxJ2pveRnfozNg5K',
  status: 'SUCCESS',
  date: Date.now() - 7200,
  amount: 23.34,
  symbol: 'XOR',
  fee: 0.23,
  from: '5HVmWWpBi69cmmDqWE4R6yxxJ2pveRnfozNg5K',
  to: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
  history: [
    { id: 1, state: 'CREATED', amount: 23.34, fee: 0.23, date: Date.now() - 7200, status: 'SUCCESS' },
    { id: 2, state: 'SUBMITTED', amount: 23.34, fee: 0.23, date: Date.now() - 7200, status: 'SUCCESS' },
    { id: 3, state: 'CONFIRMED', amount: 23.34, fee: 0.23, date: Date.now() - 7200, status: 'SUCCESS' }
  ]
}

export const getAccountActivity = async (address: string) => {
  return await Promise.resolve(
    Object.values(assetDetailsMock).flat().map(item => ({ ...item as any, fromSymbol: 'XOR' }))
  )
}

export const getAssetDetails = async (address: string, symbol: string) => {
  return await Promise.resolve(assetDetailsMock[symbol])
}

export const getTransaction = async (address: string, id: number) => {
  return await Promise.resolve(transactionMock)
}
