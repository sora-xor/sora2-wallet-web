import { AssetRegistrationSubscription } from '../../subscriptions/asset';

import { BaseModule } from './_base';

import type { SubsquidAssetEntity } from '../../types';

function parseAssetRegistrationUpdate(entity: SubsquidAssetEntity): string[] {
  return [entity.id]; // assetIds
}

export class SubsquidAssetModule extends BaseModule {
  public createAssetRegistrationSubscription(
    handler: (entity: string[]) => void,
    errorHandler: (error: any) => void
  ): VoidFunction {
    return this.root.createEntitySubscription(
      AssetRegistrationSubscription,
      {},
      parseAssetRegistrationUpdate,
      handler,
      errorHandler // fallback
    );
  }
}
