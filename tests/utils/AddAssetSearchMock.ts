import { Asset } from '@sora-substrate/util'

import { MOCK_ACCOUNT_ASSETS } from '../utils/mock'

export interface AddAssetSearchData {
  title: string;
  loading: boolean;
  search: string;
  selectedAsset: Asset | null;
}

export const MOCK_ADD_ASSET_SEARCH: Array<AddAssetSearchData> = [
  {
    title: 'Assets List Is Loading',
    loading: true,
    search: '',
    selectedAsset: null
  },
  {
    title: 'Empty Search Input',
    loading: false,
    search: '',
    selectedAsset: null
  },
  {
    title: 'No Tokens Found',
    loading: false,
    search: '123456',
    selectedAsset: null
  },
  {
    title: 'Token is Found',
    loading: false,
    search: MOCK_ACCOUNT_ASSETS[0].address,
    selectedAsset: MOCK_ACCOUNT_ASSETS[0] as Asset
  }
]
