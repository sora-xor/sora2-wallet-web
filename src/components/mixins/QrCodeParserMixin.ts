import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import TranlationMixin from './TranslationMixin';

import { RouteNames } from '../../consts';
import { api } from '../../api';

import type { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';

const reject = (message: string) => {
  throw new Error(`[QR Code]: ${message}`);
};

@Component
export default class QrCodeParserMixin extends Mixins(TranlationMixin) {
  @Getter assets!: Array<Asset>;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  async parseQrCodeValue(value: Nullable<string>): Promise<void> {
    try {
      if (!value) reject('QR Code not provided');

      const [base, assetId] = (value as string).split('::');

      if (!base || !assetId) reject(`Unsupported QR Code: ${value}`);

      const asset = this.assets.find((asset) => asset.address === assetId);

      if (!asset) reject(`Unsupported asset: ${assetId}`);

      const [chain, address, publicKey] = base.split(':');

      if (chain !== 'substrate') reject(`Unsupported chain: ${chain}`);

      const publicKeyHex = `0x${api.getPublicKeyByAddress(address)}`;

      if (publicKeyHex !== publicKey) reject(`Invalid public key`);

      this.navigate({
        name: RouteNames.WalletSend,
        params: {
          asset,
          address,
        },
      });
    } catch (error) {
      console.error(error);

      this.$notify({
        message: this.t('code.invalid'),
        type: 'error',
        title: '',
      });
    }
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
