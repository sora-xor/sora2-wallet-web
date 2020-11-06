// TODO: remove these mock data and add real integration
const addressMock = '5HVmWWpBi69cmmDGdfgg53dfgxxJ2pveRnfozNg5K'
const nameMock = 'Mock'

export const getAccount = async (seed: string) => {
  return await new Promise(resolve => resolve({ name: nameMock, address: addressMock }))
}
