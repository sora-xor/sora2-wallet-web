import { Component, Mixins } from 'vue-property-decorator';
import { Action } from 'vuex-class';

import { RouteNames } from '../../consts';
import { api } from '../../api';

import type { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';

@Component
export default class QrCodeParserMixin extends Mixins() {
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action searchAsset!: (address: string) => Promise<Asset>;

  async parseQrCodeValue(value: Nullable<string>): Promise<void> {
    if (!value) return;

    const [base, assetId] = value.split('::');

    if (!base || !assetId) return;

    const asset = await this.searchAsset(assetId);

    if (!asset) return;

    const [chain, address, publicKey] = base.split(':');

    if (chain !== 'substrate') return;

    const pKeyHex = `0x${api.getPublicKeyByAddress(address)}`;

    if (pKeyHex !== publicKey) return;

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
