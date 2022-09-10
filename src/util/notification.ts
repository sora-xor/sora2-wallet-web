import { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import { getBase64Icon } from './image';

export async function pushNotification(asset: WhitelistArrayItem, message: string): Promise<void> {
  try {
    if (Notification.permission === 'granted') {
      const notification = new Notification(asset.symbol, {
        body: message,
        icon: await getBase64Icon(asset.icon),
      });

      notification.onclick = function (event) {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        window.open('https://polkaswap.io/#/wallet');
      };
    }
  } catch {
    console.warn("Your browser doesn't support Notification API");
  }
}
