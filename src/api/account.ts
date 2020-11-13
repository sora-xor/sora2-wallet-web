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
    { operation: 'SWAP', fromAmount: 100, toSymbol: 'KSM', toAmount: 24390.1239, status: 'IN_PROGRESS', date: Date.now() - 3600 },
    { operation: 'SWAP', fromAmount: 100, toSymbol: 'KSM', toAmount: 24390.1239, status: 'ERROR', date: Date.now() - 3600 },
    { operation: 'SWAP', fromAmount: 100, toSymbol: 'KSM', toAmount: 24390.1239, status: 'SUCCESS', date: Date.now() - 3600 }
  ],
  ETH: [
    { operation: 'SWAP', fromAmount: 2.2, toSymbol: 'KSM', toAmount: 2439.1239, status: 'SUCCESS', date: Date.now() - 7200 }
  ],
  KSM: []
}
const tokensMock = [
  { name: 'Sora', symbol: 'XOR', address: '1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
  { name: 'Kusama', symbol: 'KSM', address: '34916349d43f65bccca11ff53a8e0382a1a594a7' },
  { name: 'Etherium', symbol: 'ETH', address: '8adaca8ea8192656a15c88797e04c8771c4576b3' }
]

export const getAccount = async (seed: string) => {
  return await Promise.resolve({ name: nameMock, address: addressMock })
}

export const getAccountAssets = async (address: string) => {
  return await Promise.resolve(assetsMock)
}

export const getAccountActivity = async (address: string) => {
  return await Promise.resolve(
    Object.values(assetDetailsMock).flat().map(item => ({ ...item, fromSymbol: 'XOR' }))
  )
}

export const getAssetDetails = async (address: string, symbol: string) => {
  return await Promise.resolve(assetDetailsMock[symbol])
}

export const getTokens = async (address: string) => {
  return await Promise.resolve(tokensMock)
}

export const searchToken = async (address: string, tokenAddress: string) => {
  const token = tokensMock.find(item => item.address.toLowerCase().includes(tokenAddress))
  return await Promise.resolve(token)
}

export const addToken = async (address: string, token: any) => {
  return await Promise.resolve()
}
