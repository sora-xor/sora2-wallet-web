import { Asset } from '@sora-substrate/util';

export interface AddAssetSearchData {
  title: string;
  loading: boolean;
  search: string;
  selectedAsset: Nullable<Asset>;
}

export const MOCK_ADD_ASSET_SEARCH: Array<AddAssetSearchData> = [
  {
    title: 'Empty Search Input',
    loading: false,
    search: '',
    selectedAsset: null,
  },
  {
    title: 'No Tokens Found',
    loading: false,
    search: '123456',
    selectedAsset: null,
  },
  {
    title: 'Token is Found',
    loading: false,
    search: 'TEST',
    selectedAsset: null,
  },
];
