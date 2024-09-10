import { FPNumber } from '@sora-substrate/math';
import { XOR } from '@sora-substrate/sdk/build/assets/consts';
import { defineGetters } from 'direct-vuex';

import { Currency } from '@/types/currency';
import { getCurrency } from '@/util';

import { DaiCurrency } from '../../consts/currencies';
import { rootGetterContext } from '../../store';

import { settingsGetterContext } from './../settings';

import type { SettingsState } from './types';

const getters = defineGetters<SettingsState>()({
  currencySymbol(...args): string {
    const { state } = settingsGetterContext(args);

    return getCurrency(state.currency)?.symbol ?? DaiCurrency.symbol;
  },

  exchangeRate(...args): number {
    const { state } = settingsGetterContext(args);

    if (state.currency === Currency.XOR) {
      const [, , rsArgs, rgArgs] = args;
      const { rootState } = rootGetterContext([rsArgs, rgArgs]);
      const xorPriceCodec = rootState.wallet.account.fiatPriceObject[XOR.address];
      const xorPrice = FPNumber.fromCodecValue(xorPriceCodec);
      if (xorPrice.isGtZero()) {
        return FPNumber.ONE.div(xorPrice).toNumber();
      }
      return 1;
    }

    return state.fiatExchangeRateObject[state.currency] ?? 1;
  },
});

export default getters;
