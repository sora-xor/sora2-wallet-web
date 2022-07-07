import { getBase64Icon } from './image';

export async function pushNotification(asset): Promise<void> {
  if (Notification.permission === 'granted') {
    const notification = new Notification(asset.symbol, {
      body: 'Asset balance has been deposited',
      icon: await getBase64Icon(asset.icon),
    });
  }
}
