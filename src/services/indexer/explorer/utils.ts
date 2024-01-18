import { formatStringNumber } from '../../../util';

import type { SubqueryAssetEntity } from '../subquery/types';
import type { SubsquidAssetEntity } from '../subsquid/types';
import type { FiatPriceObject, UpdatesStream, PoolApyObject } from '../types';

export function parseAssetFiatPrice(entity: SubsquidAssetEntity | SubqueryAssetEntity): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.priceUSD);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

export function parsePriceStreamUpdate(entity: UpdatesStream): Nullable<FiatPriceObject> {
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

export function parseApyStreamUpdate(entity: UpdatesStream): PoolApyObject {
  const data = entity?.data ? JSON.parse(entity.data) : {};

  return Object.entries(data).reduce((acc, [id, apy]) => {
    const strategicBonusApyFPNumber = formatStringNumber(apy as string);
    const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
    if (isStrategicBonusApyFinity) {
      acc[id] = strategicBonusApyFPNumber.toCodecString();
    }
    return acc;
  }, {});
}
