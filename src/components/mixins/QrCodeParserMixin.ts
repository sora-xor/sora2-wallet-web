import { Component, Mixins } from 'vue-property-decorator';
import type { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';

import TranlationMixin from './TranslationMixin';

import { RouteNames } from '../../consts';
import { api } from '../../api';
import { state, mutation } from '../../store/decorators';
import type { Route } from '../../store/router/types';

const reject = (message: string) => {
  throw new Error(`[QR Code]: ${message}`);
};

@Component
export default class QrCodeParserMixin extends Mixins(TranlationMixin) {
  @state.account.assets assets!: Array<Asset>;

  @mutation.router.navigate navigate!: (options: Route) => Promise<void>;

  async parseQrCodeValue(value: Nullable<string>): Promise<void> {
    try {
      if (!value) reject('QR Code not provided');

      const [chain, address, publicKey, accountName, assetId] = (value as string).split(':');

      if (chain !== 'substrate') reject(`Unsupported chain: ${chain}`);
      if (!address) reject(`Account address not provided: ${address}`);
      if (!publicKey) reject(`Account public key not provided: ${publicKey}`);
      if (!assetId) reject(`Asset ID not provided: ${assetId}`);

      const asset = this.assets.find((asset) => asset.address === assetId);

      if (!asset) reject(`Unsupported asset: ${assetId}`);

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

  recieveByQrCode(asset: Nullable<AccountAsset>): void {
    const name = asset ? RouteNames.RecieveToken : RouteNames.SelectAsset;

    this.navigate({
      name,
      params: {
        asset,
      },
    });
  }
}
