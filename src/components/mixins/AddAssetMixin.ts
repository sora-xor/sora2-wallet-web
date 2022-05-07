import { Component, Prop, Mixins } from 'vue-property-decorator';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';

import { state, getter } from '../../store/decorators';
import { AccountAssetsTable } from '@/types/common';
import TranslationMixin from './TranslationMixin';

@Component
export default class AddAssetMixin extends Mixins(TranslationMixin) {
  @state.account.assets assets!: Array<Asset>;
  @state.account.accountAssets accountAssets!: Array<AccountAsset>;

  @getter.account.accountAssetsAddressTable accountAssetsAddressTable!: AccountAssetsTable;

  @Prop({ default: false, type: Boolean }) tokenDetailsPageOpened!: boolean;

  asset: Nullable<Asset> = null;

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

  handleSelectAsset(asset: Asset): void {
    if (asset) {
      this.asset = asset;
      this.$emit('change-visibility');
    }
  }
}
