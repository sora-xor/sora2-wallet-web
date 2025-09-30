import { FPNumber, type CodecString } from '@sora-substrate/sdk';
import { BalanceType, XOR } from '@sora-substrate/sdk/build/assets/consts';
import { computed } from 'vue';

import { FontSizeRate, FontWeightRate } from '@/consts';
import type { FiatPriceObject } from '@/services/indexer/types';
import store from '@/store';

import { useNumberFormatter } from './useNumberFormatter';

import type { AccountAsset, Asset } from '@sora-substrate/sdk/build/assets/types';

export function useFormattedAmount() {
  const { getFPNumber, getFPNumberFromCodec } = useNumberFormatter();

  const fiatPriceObject = computed<FiatPriceObject>(() => store.state.wallet.account.fiatPriceObject);

  const getAssetFiatPrice = (asset: Asset | AccountAsset): Nullable<CodecString> => {
    return fiatPriceObject.value[asset.address] ?? null;
  };

  const getFiatBalance = (
    asset?: Nullable<AccountAsset>,
    type: BalanceType = BalanceType.Transferable
  ): Nullable<string> => {
    if (!asset) return null;

    const price = getAssetFiatPrice(asset);
    if (!price || !asset.balance) {
      return null;
    }

    return getFPNumberFromCodec(asset.balance[type], asset.decimals)
      .mul(FPNumber.fromCodecValue(price))
      .toLocaleString();
  };

  const resolveAmount = (amount: string | CodecString, decimals: number, isCodecString: boolean) => {
    const normalized = amount || '0';
    return isCodecString ? getFPNumberFromCodec(normalized, decimals) : getFPNumber(normalized, decimals);
  };

  const getFiatAmount = (
    amount: string | CodecString,
    asset: Asset | AccountAsset,
    isCodecString = false
  ): Nullable<string> => {
    if (!amount && amount !== '') {
      return null;
    }

    const price = getAssetFiatPrice(asset);

    if (!price) {
      return null;
    }

    return resolveAmount(amount, asset.decimals, isCodecString).mul(FPNumber.fromCodecValue(price)).toLocaleString();
  };

  const getFiatAmountByString = (amount: string, asset: AccountAsset | Asset): Nullable<string> => {
    if (!amount && amount !== '') {
      return null;
    }

    const price = getAssetFiatPrice(asset);

    if (!price) {
      return null;
    }

    return getFPNumber(amount || '0', asset.decimals)
      .mul(FPNumber.fromCodecValue(price))
      .toLocaleString();
  };

  const getFPNumberFiatAmountByFPNumber = (amount: FPNumber, asset: Asset | AccountAsset = XOR): Nullable<FPNumber> => {
    const price = getAssetFiatPrice(asset);

    if (!price) {
      return null;
    }

    return amount.mul(FPNumber.fromCodecValue(price));
  };

  const getFiatAmountByFPNumber = (amount: FPNumber, asset: Asset | AccountAsset = XOR): Nullable<string> => {
    const price = getAssetFiatPrice(asset);

    if (!price) {
      return null;
    }

    return amount.mul(FPNumber.fromCodecValue(price)).toLocaleString();
  };

  const getFiatAmountByCodecString = (amount: CodecString, asset: Asset | AccountAsset = XOR) =>
    getFiatAmount(amount, asset, true);

  return {
    FontSizeRate,
    FontWeightRate,
    getAssetFiatPrice,
    getFiatBalance,
    getFiatAmount,
    getFiatAmountByString,
    getFPNumberFiatAmountByFPNumber,
    getFiatAmountByFPNumber,
    getFiatAmountByCodecString,
  };
}
