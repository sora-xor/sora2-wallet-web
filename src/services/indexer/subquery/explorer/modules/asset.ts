import { AssetRegisrationStreamSubscription } from '../../subscriptions/asset';

import { SubqueryBaseModule } from './_base';

import type { SubqueryStreamUpdate } from '../../types';

function parseAssetRegistrationUpdate(entity: SubqueryStreamUpdate): string[] {
  const data = entity?.data ? JSON.parse(entity.data) : {};

  return Object.keys(data); // assetIds
}

export class SubqueryAssetModule extends SubqueryBaseModule {
  public createAssetsRegistrationSubscription(
    handler: (entity: string[]) => void,
    errorHandler: (error: any) => void
  ): VoidFunction {
    return this.root.createEntitySubscription(
      AssetRegisrationStreamSubscription,
      {},
      parseAssetRegistrationUpdate,
      handler,
      errorHandler // fallback
    );
  }
}
