import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../../api';
import { RouteNames } from '../../consts';
import { getter, mutation } from '../../store/decorators';

import NotificationMixin from './NotificationMixin';

import type { Route } from '../../store/router/types';
import type { AssetsTable } from '../../types/common';
import type { AccountAsset } from '@sora-substrate/sdk/build/assets/types';

const reject = (message: string) => {
  throw new Error(`[QR Code]: ${message}`);
};

@Component
export default class QrCodeParserMixin extends Mixins(NotificationMixin) {
  @getter.account.assetsDataTable assetsDataTable!: AssetsTable;

  @mutation.router.navigate navigate!: (options: Route) => Promise<void>;

  async parseQrCodeValue(value: Nullable<string>): Promise<void> {
    try {
      if (!value) reject('QR Code not provided');

      const [chain, address, publicKey, _accountName, assetId, amount] = (value as string).split(':');

      if (chain !== 'substrate') reject(`Unsupported chain: ${chain}`);
      if (!address) reject(`Account address not provided: ${address}`);
      if (!publicKey) reject(`Account public key not provided: ${publicKey}`);
      if (!assetId) reject(`Asset ID not provided: ${assetId}`);

      const asset = this.assetsDataTable[assetId];

      if (!asset) {
        reject(`Unsupported asset: ${assetId}`);
      }

      const publicKeyHex = `0x${api.getPublicKeyByAddress(address)}`;

      if (publicKeyHex !== publicKey) {
        reject(`Invalid public key: ${publicKey}`);
      }

      if (amount && !Number.isFinite(parseInt(amount))) {
        reject(`Invalid amount: ${amount}`);
      }

      this.navigate({
        name: RouteNames.WalletSend,
        params: {
          asset,
          address,
          amount,
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
