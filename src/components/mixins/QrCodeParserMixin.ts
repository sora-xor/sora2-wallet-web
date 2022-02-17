import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import { RouteNames } from '../../consts';
import { api } from '../../api';

import type { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';

@Component
export default class QrCodeParserMixin extends Mixins() {
  @Getter assets!: Array<Asset>;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  async parseQrCodeValue(value: Nullable<string>): Promise<void> {
    if (!value) return;

    const [base, assetId] = value.split('::');

    if (!base || !assetId) return;

    const asset = this.assets.find((asset) => asset.address === assetId);

    if (!asset) return;

    const [chain, address, publicKey] = base.split(':');

    if (chain !== 'substrate') return;

    const publicKeyHex = `0x${api.getPublicKeyByAddress(address)}`;

    if (publicKeyHex !== publicKey) return;

    this.navigate({
      name: RouteNames.WalletSend,
      params: {
        asset,
        address,
      },
    });
  }

  recieveByQrCode(asset?: AccountAsset) {
    const name = asset ? RouteNames.RecieveToken : RouteNames.SelectAsset;

    this.navigate({
      name,
      params: {
        asset,
      },
    });
  }
}
