import { Asset } from '@sora-substrate/util'

import { MOCK_ACCOUNT_ASSETS } from '../utils/mock'

export interface AddAssetCustomData {
  title: string;
  address: string;
  selectedAsset: Asset | null;
  alreadyAttached: boolean;
}

export const MOCK_ADD_ASSET_CUSTOM: Array<AddAssetCustomData> = [
  {
    title: 'Empty address Input',
    address: '',
    selectedAsset: null,
    alreadyAttached: false
  },
  {
    title: 'No Tokens Found',
    address: '123456',
    selectedAsset: null,
    alreadyAttached: false
  },
  {
    title: 'Token is Found',
    address: MOCK_ACCOUNT_ASSETS[0].address,
    selectedAsset: MOCK_ACCOUNT_ASSETS[0] as Asset,
    alreadyAttached: false
  },
  {
    title: 'Token was already attached',
    address: MOCK_ACCOUNT_ASSETS[0].address,
    selectedAsset: null,
    alreadyAttached: true
  }
]
