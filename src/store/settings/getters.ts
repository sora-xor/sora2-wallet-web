import { defineGetters } from 'direct-vuex';

import { getCurrency } from '@/util';

import { DaiCurrency } from '../../consts/currencies';

import { settingsGetterContext } from './../settings';

import type { SettingsState } from './types';

const getters = defineGetters<SettingsState>()({
  currencySymbol(...args): string {
    const { state } = settingsGetterContext(args);

    return getCurrency(state.currency)?.symbol ?? DaiCurrency.symbol;
  },

  exchangeRate(...args): number {
    const { state } = settingsGetterContext(args);

    return state.fiatExchangeRateObject[state.currency] ?? 1;
  },
});

export default getters;
