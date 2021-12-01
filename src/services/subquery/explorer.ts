import { axiosInstance, FPNumber } from '@sora-substrate/util';

import { HistoryElementsQuery, noirHistoryElementsFilter } from './queries/historyElements';
import { SoraNetwork } from '../../consts';
import type { Explorer, PoolXYKEntity, FiatPriceAndApyObject } from '../types';

import store from '../../store';
import { FiatPriceQuery } from './queries/fiatPriceAndApy';

export default class SubqueryExplorer implements Explorer {
  public static getApiUrl(soraNetwork?: SoraNetwork): string {
    switch (soraNetwork) {
      case SoraNetwork.Prod:
        return 'https://api.subquery.network/sq/sora-xor/sora';
      case SoraNetwork.Stage:
        return 'https://api.subquery.network/sq/sora-xor/sora-staging';
      case SoraNetwork.Test:
        return 'https://subquery.q1.tst.sora2.soramitsu.co.jp';
      case SoraNetwork.Dev:
      default:
        return 'https://subquery.q1.dev.sora2.soramitsu.co.jp';
    }
  }

  public get soraNetwork(): SoraNetwork {
    return store.getters.soraNetwork;
  }

  public async getAccountTransactions(params = {}): Promise<any> {
    const { historyElements } = await this.request(HistoryElementsQuery, params);

    return historyElements;
  }

  /**
   * Get fiat price & APY coefficient for each asset (without historical data)
   */
  public async getFiatPriceAndApyObject(): Promise<Nullable<FiatPriceAndApyObject>> {
    const format = (value: Nullable<string>) => (value ? new FPNumber(value) : FPNumber.ZERO);
    try {
      const { poolXYKEntities } = await this.request(FiatPriceQuery);
      if (!poolXYKEntities) {
        return null;
      }
      const data = (poolXYKEntities.nodes[0].pools.edges as Array<any>).reduce((acc, item) => {
        const el: PoolXYKEntity = item.node;
        const strategicBonusApyFPNumber = format(el.strategicBonusApy);
        const priceFPNumber = format(el.priceUSD);
        const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
        const isPriceFinity = priceFPNumber.isFinity();
        if (isPriceFinity || isStrategicBonusApyFinity) {
          acc[el.targetAssetId] = {};
        }
        if (isPriceFinity) {
          acc[el.targetAssetId].price = priceFPNumber.toCodecString();
        }
        if (isStrategicBonusApyFinity) {
          acc[el.targetAssetId].strategicBonusApy = strategicBonusApyFPNumber.toCodecString();
        }
        return acc;
      }, {});
      return data;
    } catch (error) {
      console.error('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  /**
   * This method should be used **only** for total redeemed value for Noir Exchange
   * @param accountId Noir Account Id
   * @param noirAssetId Noir Asset Id
   */
  public async getNoirTotalRedeemed(accountId?: string, noirAssetId?: string): Promise<number> {
    try {
      const params = {
        filter: noirHistoryElementsFilter(accountId, noirAssetId),
      };
      const { historyElements } = await this.request(HistoryElementsQuery, params);
      const count = (historyElements.edges as Array<any>).reduce((value, item) => {
        return value + +item.node.data.amount;
      }, 0);
      return ~~count;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  public async request(scheme: any, params = {}): Promise<any> {
    const url = SubqueryExplorer.getApiUrl(this.soraNetwork);
    const response = await axiosInstance.post(url, {
      query: scheme,
      variables: params,
    });

    return response.data.data;
  }
}
