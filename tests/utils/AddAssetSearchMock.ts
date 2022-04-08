export interface AddAssetSearchData {
  title: string;
  loading: boolean;
  search: string;
}

export const MOCK_ADD_ASSET_SEARCH: Array<AddAssetSearchData> = [
  {
    title: 'Empty Search Input',
    loading: false,
    search: '',
  },
  {
    title: 'No Tokens Found',
    loading: false,
    search: '123456',
  },
  {
    title: 'Token is Found',
    loading: false,
    search: 'TEST',
  },
];
