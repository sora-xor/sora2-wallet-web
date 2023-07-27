import { formatStringNumber } from '../../../../../util';
import { FiatPriceQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';
import { FiatPriceSubscription } from '../../subscriptions/fiatPriceAndApy';
import { SubsquidSnapshotTypes } from '../../types';

import { BaseModule } from './_base';

import type { SubsquidAssetEntity, FiatPriceObject } from '../../types';

function parseFiatPrice(entity: SubsquidAssetEntity): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.priceUSD);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

export class PriceModule extends BaseModule {
  /**
   * Get fiat price for each asset
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.root.fetchAllEntitiesConnection(FiatPriceQuery, {}, parseFiatPrice);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public createFiatPriceSubscription(
    handler: (entity: FiatPriceObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    return this.root.createEntitySubscription(FiatPriceSubscription, {}, parseFiatPrice, handler, errorHandler);
  }

  /**
   * Get historical data for selected asset
   * @param assetId Asset ID
   * @param type type of snapshots
   * @param first number entities (all by default)
   */
  public async getHistoricalPriceForAsset(
    assetId: string,
    type = SubsquidSnapshotTypes.DEFAULT,
    first?: number,
    after?: string
  ) {
    const filter = historicalPriceFilter(assetId, type);
    const variables = { filter, first, after };
    const response = await this.root.fetchEntitiesConnection(HistoricalPriceQuery, variables);

    return response;
  }
}
