import { Component, Prop, Mixins } from 'vue-property-decorator';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';

import { state, getter, mutation, action } from '../../store/decorators';
import { AccountAssetsTable } from '../../types/common';
import { RouteNames } from '../../consts';
import { Route } from '../../store/router/types';
import NotificationMixin from './NotificationMixin';
import LoadingMixin from './LoadingMixin';

@Component
export default class AddAssetMixin extends Mixins(NotificationMixin, LoadingMixin) {
  @state.account.assets assets!: Array<Asset>;
  @state.account.accountAssets accountAssets!: Array<AccountAsset>;

  @getter.account.accountAssetsAddressTable accountAssetsAddressTable!: AccountAssetsTable;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  @action.account.addAsset private addAsset!: (address?: string) => Promise<void>;

  @Prop({ default: false, type: Boolean }) tokenDetailsPageOpened!: boolean;

  selectedAsset: Nullable<Asset> = null;

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

  handleSelectAsset(asset: Asset): void {
    if (asset) {
      this.selectedAsset = asset;
      this.$emit('change-visibility');
    }
  }
}
