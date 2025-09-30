<template>
  <wallet-base :title="t('asset.select')" show-back @back="handleBack">
    <asset-list :assets="accountAssets" divider class="select-asset-list" :with-tabindex="false">
      <template #default="asset">
        <s-button
          type="action"
          size="small"
          alternative
          :tooltip="t('asset.receive', { symbol: asset.symbol })"
          @click="selectAsset(asset)"
        >
          <s-icon name="arrows-chevron-right-rounded-24" size="28" />
        </s-button>
      </template>
    </asset-list>
  </wallet-base>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { useTranslation } from '@/composables/useTranslation';
import { RouteNames } from '@/consts';
import store from '@/store';
import type { Route } from '@/store/router/types';

import AssetList from './AssetList.vue';
import WalletBase from './WalletBase.vue';

import type { AccountAsset } from '@sora-substrate/sdk/build/assets/types';

const { t } = useTranslation();

const accountAssets = computed<AccountAsset[]>(() => store.state.wallet.account.accountAssets);
const currentRouteParams = computed<Record<string, unknown>>(() => store.state.wallet.router.currentRouteParams);

const sendAddress = computed(() => currentRouteParams.value.address as Nullable<string>);

const navigate = (route: Route) => {
  store.commit.wallet.router.navigate(route);
};

const handleBack = () => {
  navigate({ name: RouteNames.Wallet });
};

const selectAsset = (asset: AccountAsset) => {
  const name = sendAddress.value ? RouteNames.WalletSend : RouteNames.ReceiveToken;

  navigate({
    name,
    params: {
      asset,
      address: sendAddress.value,
    },
  });
};

defineExpose({
  selectAsset,
  handleBack,
});
</script>

<style lang="scss">
.select-asset-list {
  @include asset-list($basic-spacing-big, $basic-spacing-big);
}
</style>
