import { Vue, Component, Prop } from 'vue-property-decorator';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';

import { state, getter } from '../../store/decorators';
import { AccountAssetsTable } from '@/types/common';

@Component
export default class AddAssetMixin extends Vue {
  @state.account.assets assets!: Array<Asset>;
  @state.account.accountAssets accountAssets!: Array<AccountAsset>;

  @getter.account.accountAssetsAddressTable accountAssetsAddressTable!: AccountAssetsTable;

  @Prop({ default: false, type: Boolean }) tokenDetailsPageOpened!: boolean;

  asset: Nullable<Asset> = null;

  search = '';

  get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  get assetIsAlreadyAdded(): boolean {
    if (!this.searchValue) return false;

    return this.accountAssets.some(
      ({ name = '', symbol = '', address = '' }) =>
        address.toLowerCase() === this.searchValue ||
        symbol.toLowerCase() === this.searchValue ||
        name.toLowerCase() === this.searchValue
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
