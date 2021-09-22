import { AddAssetTabs } from '../../src/consts'

export interface AddAssetData {
  title: string;
  currentTab: AddAssetTabs;
}

export const MOCK_ADD_ASSET: Array<AddAssetData> = [
  {
    title: 'Search Tab',
    currentTab: AddAssetTabs.Search
  },
  {
    title: 'Custom Asset Tab',
    currentTab: AddAssetTabs.Custom
  }
]
