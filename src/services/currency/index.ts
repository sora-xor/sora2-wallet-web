import { Notification } from '@soramitsu-ui/ui-vue2/lib/plugins/elementUI';
import { timer } from 'rxjs';

import { settingsStorage } from '@/util/storage';

import { API_ENDPOINT } from '../../consts/currencies';
import store from '../../store';

import type { FiatExchangeRateObject } from '../../types/currency';

const INTERVAL = 15;
const ONE_MINUTE = 60_000; // 1 min in milliseconds
const exchangeRateUpdateInterval = timer(0, INTERVAL * ONE_MINUTE); // 15min

export class CurrencyExchangeRateService {
  public static readonly apiEndpoint = API_ENDPOINT;

  /**
   * Returns rates by new fetching request or taking from localStorage
   * depending upon timestamp.
   *
   */
  private static async getRates(): Promise<any> {
    const rates = settingsStorage.get('fiatExchangeRates');
    const fiatExchangeRates = rates && JSON.parse(rates);

    if (fiatExchangeRates.timestamp) {
      const oldTimestamp = new Date(fiatExchangeRates.timestamp);
      const newTimestamp = new Date(Date.now());

      const deltaTime = Math.floor((newTimestamp.getTime() - oldTimestamp.getTime()) / ONE_MINUTE);

      console.log('deltaTime', deltaTime);
      console.log('INTERVAL', INTERVAL);

      if (deltaTime < INTERVAL) {
        console.log('taking from localStorage');

        return fiatExchangeRates;
      }
    }

    try {
      const exchangeRatesApi = await fetch(CurrencyExchangeRateService.apiEndpoint, { cache: 'no-store' });
      const data = (await exchangeRatesApi.json())?.dai;
      console.log('making new api call');

      return { ...data, timestamp: Date.now() };
    } catch (error) {
      console.error('[Exchange rate API] Error while fetching rates.');
      throw error;
    }
  }

  public static createExchangeRatesSubscription(
    handler: (newRates: FiatExchangeRateObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    const subscription = exchangeRateUpdateInterval.subscribe(async () => {
      try {
        const data = await this.getRates();

        if (!data) {
          this.resetData('No data arrived.');
          errorHandler();
        } else {
          handler(data);
        }
      } catch (error) {
        this.resetData(error as Error);
        errorHandler();
      }
    });

    return () => {
      console.info(`[Exchange rate API] Currency rates unsubscribe.`);
      subscription.unsubscribe();
    };
  }

  static resetData(error?: Error | string): void {
    console.warn('[Exchange rate API] not available. Now using default option.', error);
    Notification({
      message: 'Switched to DAI fiat pricing.',
      type: 'error',
      duration: 4500,
      customClass: 'sora s-flex',
    });
    store.commit.wallet.settings.updateFiatExchangeRates();
    store.commit.wallet.settings.setFiatCurrency();
  }
}
