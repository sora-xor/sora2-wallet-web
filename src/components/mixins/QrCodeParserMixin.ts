import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../../api';
import { RouteNames } from '../../consts';
import { state, mutation } from '../../store/decorators';

import NotificationMixin from './NotificationMixin';

import type { Route } from '../../store/router/types';
import type { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';

const reject = (message: string) => {
  throw new Error(`[QR Code]: ${message}`);
};

@Component
export default class QrCodeParserMixin extends Mixins(NotificationMixin) {
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
      this.showAppNotification(this.t('code.invalid'), 'error');
    }
  }

  receiveByQrCode(asset: Nullable<AccountAsset>): void {
    const name = asset ? RouteNames.ReceiveToken : RouteNames.SelectAsset;

    this.navigate({
      name,
      params: {
        asset,
      },
    });
  }
}
