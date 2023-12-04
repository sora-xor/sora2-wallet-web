import { formatStringNumber } from '../../../../../util';
import { ApyQuery } from '../../queries/fiatPriceAndApy';
import { PoolsXYKApySubscription, PoolsStreamApySubscription } from '../../subscriptions/fiatPriceAndApy';

import { SubqueryBaseModule } from './_base';

import type {
  SubqueryPoolXYKEntity,
  SubqueryPoolXYKEntityMutation,
  SubqueryStreamUpdate,
  PoolApyObject,
} from '../../types';

function parseApy(entity: SubqueryPoolXYKEntity): PoolApyObject {
  const acc = {};
  const id = entity.id;
  const strategicBonusApyFPNumber = formatStringNumber(entity.strategicBonusApy);
  const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
  if (isStrategicBonusApyFinity) {
    acc[id] = strategicBonusApyFPNumber.toCodecString();
  }
  return acc;
}

function parseApyUpdate(entity: SubqueryPoolXYKEntityMutation): PoolApyObject {
  const acc = {};
  const id = entity.id;
  const strategicBonusApyFPNumber = formatStringNumber(entity.strategic_bonus_apy);
  const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
  if (isStrategicBonusApyFinity) {
    acc[id] = strategicBonusApyFPNumber.toCodecString();
  }
  return acc;
}

function parseStreamUpdate(entity: SubqueryStreamUpdate): PoolApyObject {
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

export class SubqueryPoolModule extends SubqueryBaseModule {
  /**
   * Get strategic bonus APY for each pool
   */
  public async getPoolsApyObject(): Promise<Nullable<PoolApyObject>> {
    const result = await this.root.fetchAllEntities(ApyQuery, {}, parseApy);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public createPoolsApySubscription(
    handler: (entity: PoolApyObject) => void,
    errorHandler: (error: any) => void
  ): VoidFunction {
    let subscription!: VoidFunction;

    subscription = this.root.createEntitySubscription(
      PoolsStreamApySubscription,
      {},
      parseStreamUpdate,
      handler,
      () => {
        subscription = this.root.createEntitySubscription(
          PoolsXYKApySubscription,
          {},
          parseApyUpdate,
          handler,
          errorHandler
        );
      }
    );

    return subscription;
  }
}
