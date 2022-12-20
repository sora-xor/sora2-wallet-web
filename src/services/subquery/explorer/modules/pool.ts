import { BaseModule } from './_base';

import { ApyQuery } from '../../queries/fiatPriceAndApy';
import { PoolsApySubscription } from '../../subscriptions/fiatPriceAndApy';

import { formatStringNumber } from '../../../../util';

import type { PoolXYKEntity, PoolApyObject } from '../../types';

function parseApy(entity: PoolXYKEntity): PoolApyObject {
  const acc = {};
  const id = entity.id;
  const strategicBonusApyFPNumber = formatStringNumber(entity.strategicBonusApy || entity.strategic_bonus_apy);
  const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
  if (isStrategicBonusApyFinity) {
    acc[id] = strategicBonusApyFPNumber.toCodecString();
  }
  return acc;
}

export class PoolModule extends BaseModule {
  /**
   * Get strategic bonus APY for each pool
   */
  public async getPoolsApyObject(): Promise<Nullable<PoolApyObject>> {
    const result = await this.fetchAndParseEntities(parseApy, ApyQuery);

    return result;
  }

  public createPoolsApySubscription(handler: (entity: PoolApyObject) => void, errorHandler: () => void): VoidFunction {
    return this.createEntitySubscription(PoolsApySubscription, {}, parseApy, handler, errorHandler);
  }
}
