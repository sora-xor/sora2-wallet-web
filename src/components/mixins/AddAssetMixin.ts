import { Component, Prop, Mixins } from 'vue-property-decorator';

import { RouteNames } from '../../consts';
import { state, getter, mutation, action } from '../../store/decorators';

import LoadingMixin from './LoadingMixin';
import NotificationMixin from './NotificationMixin';

import type { Route } from '../../store/router/types';
import type { AccountAssetsTable } from '../../types/common';
import type { AccountAsset, Asset } from '@sora-substrate/sdk/build/assets/types';

@Component
export default class AddAssetMixin extends Mixins(NotificationMixin, LoadingMixin) {
  @state.account.assets assets!: Array<Asset>;
  @state.account.accountAssets accountAssets!: Array<AccountAsset>;

  @getter.account.accountAssetsAddressTable accountAssetsAddressTable!: AccountAssetsTable;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  @action.account.addAsset private addAsset!: (address?: string) => Promise<void>;

  @Prop({ default: false, type: Boolean }) tokenDetailsPageOpened!: boolean;

  selectedAsset: Nullable<Asset> = null;
  selectedAssets: Array<Asset> = [];
  search = '';

  get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  getSoughtAssets(assets: Array<Asset>): Array<Asset> {
    return assets.filter(
      ({ name, symbol, address }) =>
        address.toLowerCase() === this.searchValue ||
        symbol.toLowerCase().includes(this.searchValue) ||
        name.toLowerCase().includes(this.searchValue)
    );
  }

  resetSearch(): void {
    this.search = '';
  }

  async addAccountAsset(addedAsset): Promise<void> {
    const asset: Partial<Asset> = addedAsset || {};
    await this.withLoading(async () => await this.addAsset(asset.address));
    this.navigate({ name: RouteNames.Wallet, params: { asset: addedAsset } });
    this.showAppNotification(this.t('addAsset.success', { symbol: asset.symbol || '' }), 'success');
  }

  handleSelectAsset(asset: Asset, selectable: boolean): void {
    if (asset) {
      if (selectable) {
        const assetIndex = this.selectedAssets.findIndex((a) => a.address === asset.address);
        if (assetIndex >= 0) {
          this.selectedAssets.splice(assetIndex, 1);
        } else {
          this.selectedAssets.push(asset);
        }
      } else {
        this.selectedAsset = asset;
        this.$emit('change-visibility');
      }
    }
  }
}
