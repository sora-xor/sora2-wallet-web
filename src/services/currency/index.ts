import { interval } from 'rxjs';

import { API_ENDPOINT } from '../../consts/currencies';
import store from '../../store';
import { Currency, type FiatExchangeRateObject } from '../../types/currency';

const exchangeRateUpdateInterval = interval(60_000);

export class CurrencyExchangeRate {
  public static apiEndpoint = API_ENDPOINT;
  private fiatExchangeRateObject: FiatExchangeRateObject = {};

  public static async getExchangeRateObject(): Promise<Nullable<FiatExchangeRateObject>> {
    try {
      const exchangeRatesApi = await fetch(CurrencyExchangeRate.apiEndpoint, { cache: 'no-store' });
      return exchangeRatesApi.json();
    } catch (error) {
      console.warn('[Exchange rate API] not available. Now using default option', error);
      store.commit.wallet.settings.updateFiatExchangeRates({ [Currency.USD]: 1 });
      store.commit.wallet.settings.setFiatCurrency(Currency.USD);
      return null;
    }
  }

  public static createExchangeRatesSubscription(): void {
    const subscription = exchangeRateUpdateInterval.subscribe(async () => {
      const data = await CurrencyExchangeRate.getExchangeRateObject();
    });
  }

  static updateData(newRates: FiatExchangeRateObject): void {
    store.commit.wallet.settings.updateFiatExchangeRates(newRates);
  }
}
