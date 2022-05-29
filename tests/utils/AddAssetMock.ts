import { AddAssetTabs } from '@/consts';

export interface AddAssetData {
  title: string;
  currentTab: AddAssetTabs;
}

export const MOCK_ADD_ASSET: Array<AddAssetData> = [
  {
    title: 'Search Tab',
    currentTab: AddAssetTabs.Token,
  },
  {
    title: 'Custom Asset Tab',
    currentTab: AddAssetTabs.NFT,
  },
];
