import { Notification } from '@soramitsu-ui/ui-vue2/lib/plugins/elementUI';
import { timer } from 'rxjs';

import { API_ENDPOINT } from '../../consts/currencies';
import store from '../../store';

import type { FiatExchangeRateObject } from '../../types/currency';

const exchangeRateUpdateInterval = timer(0, 15 * 60_000); // 15min

export class CurrencyExchangeRateService {
  public static readonly apiEndpoint = API_ENDPOINT;

  public static createExchangeRatesSubscription(
    handler: (newRates: FiatExchangeRateObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    const subscription = exchangeRateUpdateInterval.subscribe(async () => {
      try {
        const exchangeRatesApi = await fetch(CurrencyExchangeRateService.apiEndpoint, { cache: 'no-store' });
        const data = (await exchangeRatesApi.json())?.dai;

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
