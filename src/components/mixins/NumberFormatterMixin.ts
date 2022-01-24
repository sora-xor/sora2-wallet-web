import { Vue, Component } from 'vue-property-decorator';
import { FPNumber, CodecString } from '@sora-substrate/util';
import { MaxTotalSupply, KnownAssets } from '@sora-substrate/util/build/assets/consts';

@Component
export default class NumberFormatterMixin extends Vue {
  readonly Zero = FPNumber.ZERO;
  readonly Hundred = FPNumber.HUNDRED;

  getFPNumber(value: string | number, decimals?: number): FPNumber {
    return new FPNumber(value, decimals);
  }

  getFPNumberFromCodec(value: CodecString, decimals?: number): FPNumber {
    return FPNumber.fromCodecValue(value, decimals);
  }

  formatCodecNumber(value: CodecString, decimals?: number): string {
    return this.getFPNumberFromCodec(value, decimals).toLocaleString();
  }

  formatStringValue(value: string, decimals?: number): string {
    return this.getFPNumber(value, decimals).toLocaleString();
  }

  getStringFromCodec(value: CodecString, decimals?: number): string {
    return FPNumber.fromCodecValue(value, decimals).toString();
  }

  isCodecZero(value: CodecString, decimals?: number): boolean {
    return this.getFPNumberFromCodec(value, decimals).isZero();
  }

  getMax(address: string): string {
    if (!address) {
      return MaxTotalSupply;
    }
    const knownAsset = KnownAssets.get(address);
    if (!knownAsset) {
      return MaxTotalSupply;
    }
    return knownAsset.totalSupply || MaxTotalSupply;
  }

  getCorrectSupply(tokenSupply, decimals): string {
    const fpnTokenSupply = this.getFPNumber(tokenSupply, decimals);
    const fpnMaxTokenSupply = this.getFPNumber(MaxTotalSupply, decimals);

    if (FPNumber.gt(fpnTokenSupply, fpnMaxTokenSupply)) {
      return fpnMaxTokenSupply.toString();
    }

    return tokenSupply;
  }
}
