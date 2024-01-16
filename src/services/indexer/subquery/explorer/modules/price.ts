import { formatStringNumber } from '../../../../../util';
import { FiatPriceQuery, FiatPriceStreamQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';
import { FiatAssetsPriceSubscription, FiatStreamPriceSubscription } from '../../subscriptions/fiatPriceAndApy';
import { AssetSnapshotEntity, ConnectionQueryResponseData, SnapshotTypes } from '../../types';

import { SubqueryBaseModule } from './_base';

import type {
  SubqueryAssetEntity,
  SubqueryAssetEntityMutation,
  SubqueryStreamUpdate,
  FiatPriceObject,
} from '../../types';

function parseFiatPrice(entity: SubqueryAssetEntity): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.priceUSD);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

function parseFiatPriceUpdate(entity: SubqueryAssetEntityMutation): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.price_u_s_d);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

function parseStreamUpdate(entity: SubqueryStreamUpdate): Nullable<FiatPriceObject> {
  if (!entity?.data) return null;

  const data = JSON.parse(entity.data);

  return Object.entries(data).reduce((acc, [id, price]) => {
    const priceFPNumber = formatStringNumber(price as string);
    const isPriceFinity = priceFPNumber.isFinity();
    if (isPriceFinity) {
      acc[id] = priceFPNumber.toCodecString();
    }
    return acc;
  }, {});
}

export class SubqueryPriceModule extends SubqueryBaseModule {
  /**
   * Get fiat price for each asset
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.root.fetchAllEntities(FiatPriceQuery, {}, parseFiatPrice);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public async getFiatPriceUpdates(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.root.request(FiatPriceStreamQuery);

    if (!result) return null;

    const updates = parseStreamUpdate(result.data);

    return updates;
  }

  public createFiatPriceSubscription(
    handler: (entity: Nullable<FiatPriceObject>) => void,
    errorHandler: () => void
  ): VoidFunction {
    let subscription!: VoidFunction;

    subscription = this.root.createEntitySubscription(
      FiatStreamPriceSubscription,
      {},
      parseStreamUpdate,
      handler,
      () => {
        subscription = this.root.createEntitySubscription(
          FiatAssetsPriceSubscription,
          {},
          parseFiatPriceUpdate,
          handler,
          errorHandler
        );
      }
    );

    return subscription;
  }

  /**
   * Get historical data for selected asset
   * @param assetId Asset ID
   * @param type type of snapshots
   * @param first number entities (all by default)
   */
  public async getHistoricalPriceForAsset(
    assetId: string,
    type = SnapshotTypes.DEFAULT,
    first?: number,
    after?: string
  ): Promise<Nullable<ConnectionQueryResponseData<AssetSnapshotEntity>>> {
    const filter = historicalPriceFilter(assetId, type);
    const variables = { filter, first, after };
    const data = await this.root.fetchEntities(HistoricalPriceQuery, variables);

    return data;
  }
}
