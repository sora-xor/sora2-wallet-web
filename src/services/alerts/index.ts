import { FPNumber } from '@sora-substrate/util';
import { Subject } from 'rxjs';

import { Singleton } from '../../decorators';
import store from '../../store';
import { getBase64Icon } from '../../util/image';

import type { Alert } from '../../types/common';
import type { FiatPriceObject } from '../indexer/subsquid/types';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

@Singleton
export class AlertsApiService {
  private fiatPriceObject: FiatPriceObject = {};
  public alerts = [] as Array<Alert>;
  public baseRoute = 'https://polkaswap.io/#/';

  private isAlertSetByUser(): boolean {
    return !!store.state.wallet.settings.alerts.length;
  }

  public async pushNotification(asset: WhitelistArrayItem, message: string): Promise<void> {
    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification(asset.symbol, {
          body: message,
          icon: await getBase64Icon(asset.icon),
        });

        notification.onclick = (event) => {
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          window.open(`${this.baseRoute}wallet`);
        };
      }
    } catch {
      console.warn("Your browser doesn't support Notification API");
    }
  }

  private checkAlerts() {
    this.alerts.forEach((alert, position) => {
      if (alert.wasNotified) return;

      const tokenAddress = store.getters.wallet.account.whitelistIdsBySymbol[alert.token];

      const currentPrice = FPNumber.fromCodecValue(this.fiatPriceObject[tokenAddress]);
      const desiredPrice = FPNumber.fromNatural(alert.price);

      if (alert.type === 'drop') {
        if (FPNumber.lte(currentPrice, desiredPrice)) {
          const asset = store.getters.wallet.account.whitelist[tokenAddress];

          if (asset) {
            this.pushNotification(asset as WhitelistArrayItem, `Token price dropped to $${desiredPrice}`);
            alert.once ? this.removeAlert(position) : this.setAlertAsNotified(position, true);
          }
        }

        return;
      }

      if (alert.type === 'raise') {
        if (FPNumber.gte(currentPrice, desiredPrice)) {
          const asset = store.getters.wallet.account.whitelist[tokenAddress];

          if (asset) {
            this.pushNotification(asset as WhitelistArrayItem, `Token price raised to $${desiredPrice}`);
            alert.once ? this.removeAlert(position) : this.setAlertAsNotified(position, true);
          }
        }
      }
    });
  }

  private resetPriceAlerts(): void {
    this.alerts.forEach((alert, position) => {
      if (!alert.wasNotified) return alert;

      const tokenAddress = store.getters.wallet.account.whitelistIdsBySymbol[alert.token];

      const currentPrice = FPNumber.fromCodecValue(this.fiatPriceObject[tokenAddress]);
      const desiredPrice = FPNumber.fromNatural(alert.price);

      if (alert.type === 'drop') {
        if (FPNumber.gt(currentPrice, desiredPrice)) {
          this.setAlertAsNotified(position, false);
        }

        return;
      }

      if (alert.type === 'raise') {
        if (FPNumber.lt(currentPrice, desiredPrice)) {
          this.setAlertAsNotified(position, false);
        }
      }
    });
  }

  public removeAlert(position: number): void {
    store.commit.wallet.settings.removePriceAlert(position);
  }

  public setAlertAsNotified(position: number, value: boolean): void {
    store.commit.wallet.settings.setPriceAlertAsNotified({ position, value });
  }

  createPriceAlertSubscription(): Subject<FiatPriceObject> {
    const alertSubject = new Subject<FiatPriceObject>();

    alertSubject.subscribe({
      next: (fiatPriceObject: FiatPriceObject) => {
        if (!this.isAlertSetByUser()) return;

        this.alerts = store.state.wallet.settings.alerts;

        this.fiatPriceObject = fiatPriceObject;

        this.checkAlerts();
        this.resetPriceAlerts();
      },
    });

    return alertSubject;
  }
}

export default new AlertsApiService();
