import { Subject } from 'rxjs';
import { FPNumber } from '@sora-substrate/util';

import { Alert } from '@/types/common';
import store from '@/store';
import { getBase64Icon } from '../../util/image';
import type { FiatPriceObject } from '../subquery/types';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

export class AlertsApiService {
  static fiatPriceObject: FiatPriceObject = {};
  static alerts = [] as Array<Alert>;

  private static isAlertSetByUser(): boolean {
    return !!store.state.wallet.settings.alerts.length;
  }

  static async pushNotification(asset: WhitelistArrayItem, message: string): Promise<void> {
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

  private static checkAlerts() {
    this.alerts.forEach((alert, position) => {
      if (alert.wasNotified) return;

      const tokenAddress = store.getters.wallet.account.whitelistIdsBySymbol[alert.token];

      const currentPrice = FPNumber.fromCodecValue(this.fiatPriceObject[tokenAddress]);
      const desiredPrice = FPNumber.fromNatural(alert.price);

      if (alert.type === 'onDrop') {
        if (FPNumber.lte(currentPrice, desiredPrice)) {
          const asset = store.getters.wallet.account.whitelist[tokenAddress];
          AlertsApiService.pushNotification(
            asset as WhitelistArrayItem,
            `${alert.token} price dropped to ${desiredPrice}`
          );
          alert.once ? this.removeAlert(position) : this.setAlertAsNotified(position, true);
        }

        return;
      }

      if (alert.type === 'onRaise') {
        if (FPNumber.gte(currentPrice, desiredPrice)) {
          const asset = store.getters.wallet.account.whitelist[tokenAddress];
          AlertsApiService.pushNotification(
            asset as WhitelistArrayItem,
            `${alert.token} price increased to ${desiredPrice}`
          );
          alert.once ? this.removeAlert(position) : this.setAlertAsNotified(position, true);
        }
      }
    });
  }

  private static resetPriceAlerts(): void {
    this.alerts.forEach((alert, position) => {
      if (!alert.wasNotified) return alert;

      const tokenAddress = store.getters.wallet.account.whitelistIdsBySymbol[alert.token];

      const currentPrice = FPNumber.fromCodecValue(this.fiatPriceObject[tokenAddress]);
      const desiredPrice = FPNumber.fromNatural(alert.price);

      if (alert.type === 'onDrop') {
        if (FPNumber.gt(currentPrice, desiredPrice)) {
          this.setAlertAsNotified(position, false);
        }

        return;
      }

      if (alert.type === 'onRaise') {
        if (FPNumber.lt(currentPrice, desiredPrice)) {
          this.setAlertAsNotified(position, false);
        }
      }
    });
  }

  public static removeAlert(position: number): void {
    store.commit.wallet.settings.removePriceAlert(position);
  }

  public static setAlertAsNotified(position: number, value: boolean): void {
    store.commit.wallet.settings.setPriceAlertAsNotified({ position, value });
  }

  static createPriceAlertSubscription(): Subject<FiatPriceObject> {
    const alertSubject = new Subject<FiatPriceObject>();

    alertSubject.subscribe({
      next: (fiatPriceObject: FiatPriceObject) => {
        if (!AlertsApiService.isAlertSetByUser()) return;

        this.alerts = store.state.wallet.settings.alerts;

        this.fiatPriceObject = fiatPriceObject;

        this.resetPriceAlerts();
        this.checkAlerts();
      },
    });

    return alertSubject;
  }
}
