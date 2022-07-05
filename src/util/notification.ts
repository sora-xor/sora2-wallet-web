import { Asset, Whitelist } from '@sora-substrate/util/build/assets/types';

export async function pushNotification(asset: Asset, isAssetDeposited: boolean, whitelist: Whitelist): Promise<void> {
  console.log('called');
  if (!isAssetDeposited) return;

  if (Notification.permission === 'granted') {
    const accountAsset = Object.keys(whitelist).find((address) => address === asset.address);
    console.log('accountAsset', accountAsset);

    const notification = new Notification(asset.symbol, {
      body: 'Asset balance has been deposited',
      icon: 'data:image/png;base64,',
    });
  }
}
