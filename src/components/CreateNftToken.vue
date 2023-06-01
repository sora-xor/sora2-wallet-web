<template>
  <div class="wallet-settings-create-token">
    <template v-if="step === Step.CreateNftToken">
      <s-input
        :placeholder="t('createToken.nft.link.placeholder')"
        :minlength="1"
        :maxlength="200"
        :disabled="loading"
        v-model="tokenContentLink"
        @input="handleInputLinkChange"
      >
        <s-tooltip
          slot="suffix"
          popper-class="ipfs-tooltip"
          :content="t('createToken.nft.link.tooltip')"
          placement="bottom"
          tabindex="-1"
        >
          <s-icon class="ipfs-tooltip__icon" name="info-16" size="18px" />
        </s-tooltip>
      </s-input>
      <file-uploader
        ref="uploader"
        class="preview-image-create-nft"
        :is-link-provided="!!contentSrcLink"
        @upload="upload"
        @clear="clear"
        @show-limit="showLimit"
        @hide-limit="hideLimit"
      >
        <div v-if="imageLoading" v-loading="imageLoading" />
        <div v-else-if="fileExceedsLimit" class="placeholder">
          <s-icon class="preview-image-create-nft__icon icon--error" name="basic-clear-X-24" size="32px" />
          <span>{{ t('createToken.nft.image.placeholderFileLimit', { value: FILE_SIZE_LIMIT }) }}</span>
          <s-button class="preview-image-create-nft__btn">{{ t('createToken.nft.source.limit') }}</s-button>
        </div>
        <div v-else-if="!tokenContentLink && !file" class="placeholder">
          <s-icon class="preview-image-create-nft__icon" name="camera-16" size="32px" />
          <span class="preview-image-create-nft__placeholder">{{ t('createToken.nft.image.placeholderNoImage') }}</span>
        </div>
        <div v-else-if="badSource && !file" class="placeholder">
          <s-icon class="preview-image-create-nft__icon icon--error" name="basic-clear-X-24" size="32px" />
          <span class="preview-image-create-nft__placeholder">{{
            t('createToken.nft.image.placeholderBadSource')
          }}</span>
        </div>
        <div v-else class="image">
          <img class="preview-image-create-nft__content" :src="contentSrcLink" />
        </div>
      </file-uploader>
      <s-input
        :placeholder="t('createToken.tokenSymbol.placeholder')"
        :minlength="1"
        :maxlength="7"
        :disabled="loading"
        v-maska="tokenSymbolMask"
        v-model="tokenSymbol"
      />
      <p class="wallet-settings-create-token_desc">{{ t('createToken.tokenSymbol.desc') }}</p>
      <s-input
        :placeholder="t('createToken.tokenName.placeholder')"
        :minlength="1"
        :maxlength="33"
        :disabled="loading"
        v-maska="tokenNameMask"
        v-model="tokenName"
      />
      <p class="wallet-settings-create-token_desc">{{ t('createToken.tokenName.desc') }}</p>
      <s-input
        class="input-textarea"
        type="textarea"
        :placeholder="t('createToken.nft.description.placeholder')"
        :disabled="loading"
        :maxlength="200"
        v-model="tokenDescription"
        @keypress.native="handleTextAreaInput($event)"
      />
      <s-float-input
        has-locale-string
        :placeholder="t('createToken.nft.supply.placeholder')"
        :decimals="decimals"
        :delimiters="delimiters"
        :max="maxTotalSupply"
        :disabled="loading"
        v-model="tokenSupply"
      />
      <p class="wallet-settings-create-token_desc">{{ t('createToken.nft.supply.desc') }}</p>
      <div class="wallet-settings-create-token_supply-block">
        <s-switch v-model="extensibleSupply" :disabled="loading" />
        <span>{{ t('createToken.extensibleSupply.placeholder') }}</span>
      </div>
      <p class="wallet-settings-create-token_desc">{{ t('createToken.extensibleSupply.desc') }}</p>
      <div class="delimiter"></div>
      <div class="wallet-settings-create-token_divisible-block">
        <s-switch v-model="divisible" :disabled="loading" @change="handleChangeDivisible" />
        <span>{{ t('createToken.divisible.placeholder') }}</span>
      </div>
      <p class="wallet-settings-create-token_desc">{{ t('createToken.divisible.desc') }}</p>
      <s-button
        class="wallet-settings-create-token_action s-typography-button--large"
        type="primary"
        :loading="loading"
        :disabled="isCreateDisabled"
        @click="onCreate"
      >
        <template v-if="!tokenContentLink.trim() && !file">{{ t('createToken.provideContent') }}</template>
        <template v-else-if="!tokenSymbol">{{ t('createToken.enterSymbol') }}</template>
        <template v-else-if="!tokenName.trim()">{{ t('createToken.enterName') }}</template>
        <template v-else-if="!+tokenSupply">{{ t('createToken.enterSupply') }}</template>
        <template v-else-if="!tokenDescription">{{ t('createToken.enterTokenDescription') }}</template>
        <template v-else-if="badSource">{{ t('createToken.provideContent') }}</template>
        <template v-else>{{ t('createToken.actionNFT') }}</template>
      </s-button>
    </template>
    <template v-else-if="step === Step.Warn">
      <network-fee-warning-dialog :fee="formattedFee" @confirm="confirmNextTxFailure" />
    </template>
    <template v-else-if="step === Step.ConfirmNftToken">
      <nft-details
        :content-link="contentSrcLink"
        :token-name="tokenName"
        :token-symbol="tokenSymbol"
        :token-description="tokenDescription"
      />
      <div class="info-line-container">
        <info-line :label="t('createToken.nft.source.label')" :value="contentSource"></info-line>
        <info-line :label="t('createToken.nft.supply.quantity')" :value="tokenSupply"></info-line>
      </div>
      <s-button
        class="wallet-settings-create-token_action s-typography-button--large"
        type="primary"
        :disabled="!hasEnoughXor"
        :loading="loading"
        @click="onConfirm"
      >
        <template v-if="!hasEnoughXor">{{ t('createToken.insufficientBalance', { symbol: XOR_SYMBOL }) }}</template>
        <template v-else>{{ t('createToken.confirm') }}</template>
      </s-button>
    </template>

    <wallet-fee v-if="!isCreateDisabled && showFee" :value="fee" />
  </div>
</template>

<script lang="ts">
import { FPNumber, Operation } from '@sora-substrate/util';
import { MaxTotalSupply, XOR } from '@sora-substrate/util/build/assets/consts';
import { File as ImageNFT } from 'nft.storage';
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator';

import { api } from '../api';
import LoadingMixin from '../components/mixins/LoadingMixin';
import TransactionMixin from '../components/mixins/TransactionMixin';
import TranslationMixin from '../components/mixins/TranslationMixin';
import { RouteNames, Step } from '../consts';
import { state, mutation, action } from '../store/decorators';
import { IMAGE_MIME_TYPES } from '../util/image';
import { IpfsStorage } from '../util/ipfsStorage';

import FileUploader from './FileUploader.vue';
import InfoLine from './InfoLine.vue';
import NetworkFeeWarningDialog from './NetworkFeeWarning.vue';
import NftDetails from './NftDetails.vue';
import WalletFee from './WalletFee.vue';
import NetworkFeeWarningMixin from './mixins/NetworkFeeWarningMixin';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';

import type { Route } from '../store/router/types';
import type { NFTStorage } from 'nft.storage';

@Component({
  components: {
    InfoLine,
    WalletFee,
    NftDetails,
    NetworkFeeWarningDialog,
    FileUploader,
  },
})
export default class CreateNftToken extends Mixins(
  TranslationMixin,
  TransactionMixin,
  LoadingMixin,
  NumberFormatterMixin,
  NetworkFeeWarningMixin
) {
  readonly tokenSymbolMask = 'AAAAAAA';
  readonly tokenNameMask = { mask: 'Z*', tokens: { Z: { pattern: /[0-9a-zA-Z ]/ } } };
  readonly maxTotalSupply = MaxTotalSupply;
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;
  readonly Step = Step;
  readonly XOR_SYMBOL = XOR.symbol;
  readonly FILE_SIZE_LIMIT = 100; // in megabytes

  @Prop({ default: Step.CreateSimpleToken, type: String }) readonly step!: Step;

  @state.settings.nftStorage private nftStorage!: NFTStorage;
  @mutation.router.navigate private navigate!: (options: Route) => void;
  @action.settings.createNftStorageInstance private createNftStorageInstance!: AsyncFnWithoutArgs;

  @Ref('fileInput') readonly fileInput!: HTMLInputElement;
  @Ref('uploader') readonly uploader!: HTMLFormElement;

  imageLoading = false;
  fileExceedsLimit = false;
  badSource = false;
  contentSrcLink = '';
  tokenContentIpfsParsed = '';
  tokenContentLink = '';
  tokenSymbol = '';
  tokenName = '';
  tokenDescription = '';
  tokenSupply = '';
  showFee = true;
  file: Nullable<File> = null;
  extensibleSupply = false;
  divisible = false;

  private calcDecimals(divisible: boolean): number {
    return divisible ? FPNumber.DEFAULT_PRECISION : 0;
  }

  get decimals(): number {
    return this.calcDecimals(this.divisible);
  }

  get isCreateDisabled(): boolean {
    return (
      !(this.tokenSymbol && this.tokenName.trim() && +this.tokenSupply && this.tokenDescription.trim()) ||
      this.badSource ||
      !(this.file || this.tokenContentLink)
    );
  }

  get fee(): FPNumber {
    return this.getFPNumberFromCodec(this.networkFees.RegisterAsset);
  }

  get formattedFee(): string {
    return this.fee.toLocaleString();
  }

  get contentSource(): string {
    if (this.file) return this.t('createToken.nft.source.value');
    return IpfsStorage.getStorageHostname(this.tokenContentLink);
  }

  get hasEnoughXor(): boolean {
    return FPNumber.gte(this.xorBalance, this.fee); // xorBalance -> NetworkFeeWarningMixin
  }

  async upload(file: File): Promise<void> {
    this.imageLoading = true;
    this.file = file;
    this.contentSrcLink = await IpfsStorage.fileToBase64(file);
    this.badSource = false;
    this.imageLoading = false;
    this.tokenContentLink = '';
  }

  showLimit(): void {
    this.contentSrcLink = '';
    this.fileExceedsLimit = true;
  }

  hideLimit(): void {
    this.contentSrcLink = '';
    this.fileExceedsLimit = false;
  }

  handleChangeDivisible(value: boolean): void {
    if (!value && this.tokenSupply) {
      const decimals = this.calcDecimals(value);
      this.tokenSupply = this.getCorrectSupply(this.tokenSupply, decimals);
    }
  }

  handleInputLinkChange(link: string): void {
    this.uploader.resetFileInput();
    this.resetFileInput();
    this.fileExceedsLimit = false;
    this.contentSrcLink = '';

    try {
      const url = new URL(link);
    } catch {
      this.badSource = true;
      return;
    }

    this.checkImageFromSource(link);
  }

  handleTextAreaInput(e: KeyboardEvent): boolean | void {
    if (/^[A-Za-z0-9 _',.#]+$/.test(e.key)) return true;
    e.preventDefault();
  }

  async checkImageFromSource(url: string): Promise<void> {
    this.imageLoading = true;
    this.badSource = false;

    try {
      const response = await fetch(url);
      const buffer = await response.blob();
      this.imageLoading = false;

      if (this.isValidType(buffer.type)) {
        this.badSource = false;
        this.contentSrcLink = url;
        this.tokenContentIpfsParsed = IpfsStorage.getIpfsPath(url);
      } else {
        this.badSource = true;
        this.contentSrcLink = '';
      }
    } catch (error) {
      this.badSource = true;
      this.contentSrcLink = '';
    }

    this.resetFileInput();
  }

  isValidType(type: string): boolean {
    return Object.values(IMAGE_MIME_TYPES).includes(type);
  }

  clear(): void {
    this.tokenContentLink = '';
    this.contentSrcLink = '';
    this.resetFileInput();
  }

  resetFileInput(): void {
    this.file = null;
    this.imageLoading = false;
  }

  async storeNftImage(file: File): Promise<void> {
    const content = (await IpfsStorage.fileToBuffer(file)) as ArrayBuffer;

    if (!this.nftStorage) {
      await this.createNftStorageInstance();
    }

    try {
      const metadata = await this.nftStorage.store({
        name: file.name,
        description: this.tokenDescription,
        image: new ImageNFT([content], file.name, { type: file.type }),
      });

      this.tokenContentIpfsParsed = IpfsStorage.getIpfsPath(metadata.embed().image.href);
    } catch (error) {
      console.error('Error while storing NFT content:', error);
    }
  }

  async registerNftAsset(): Promise<void> {
    if (!this.tokenContentIpfsParsed.trim()) {
      throw new Error('IPFS Token issue');
    }
    return api.assets.register(
      this.tokenSymbol,
      this.tokenName.trim(),
      this.tokenSupply,
      this.extensibleSupply,
      !this.divisible,
      { content: this.tokenContentIpfsParsed, description: this.tokenDescription.trim() }
    );
  }

  onCreate(): void {
    if (
      !this.tokenSymbol.length ||
      !this.tokenSupply.length ||
      !this.tokenDescription.length ||
      !this.tokenName.length ||
      this.badSource
    ) {
      return;
    }

    this.tokenSupply = this.getCorrectSupply(this.tokenSupply, this.decimals);

    this.$emit('showTabs');

    if (this.allowFeePopup && this.hasEnoughXor && !this.isXorSufficientForNextTx({ type: Operation.RegisterAsset })) {
      this.$emit('showHeader');
      this.showFee = false;
      this.$emit('stepChange', Step.Warn);
      return;
    }

    this.showFee = true;
    this.$emit('stepChange', Step.ConfirmNftToken);
  }

  async onConfirm(): Promise<void> {
    await this.withNotifications(async () => {
      if (!this.hasEnoughXor) {
        throw new Error('walletSend.badAmount');
      }
      if (this.file) {
        await this.storeNftImage(this.file);
      }
      await this.registerNftAsset();
      this.navigate({ name: RouteNames.Wallet });
    });
  }

  confirmNextTxFailure(): void {
    this.$emit('showHeader');
    this.showFee = true;
    this.$emit('stepChange', Step.ConfirmNftToken);
  }
}
</script>

<style lang="scss" scoped>
.info-line-container {
  text-transform: uppercase;
  margin-bottom: calc(var(--s-size-small) / 2);
}
</style>

<style lang="scss">
.wallet-settings-create-token {
  .ipfs-tooltip {
    font-size: 10px !important;
    padding: 10px 15px !important;
    &__icon {
      color: var(--s-color-base-content-tertiary);
      &:hover {
        cursor: pointer;
        color: var(--s-color-base-content-secondary);
      }
    }
  }
  &_desc {
    color: var(--s-color-base-content-primary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    padding: var(--s-basic-spacing) #{$basic-spacing-small} #{$basic-spacing-medium};
  }

  &_action {
    margin-top: #{$basic-spacing-medium};
    width: 100%;
  }

  &_supply-block,
  &_divisible-block {
    @include switch-block;
    padding: 0 #{$basic-spacing-small};
  }
}

.s-textarea {
  margin-bottom: #{$basic-spacing-medium};
}

.el-textarea {
  height: 54px;

  &__inner {
    resize: none;
    scrollbar-width: none; /* Firefox - not customizable */

    &:hover::-webkit-scrollbar {
      width: 4px;

      &-thumb {
        background-color: var(--s-color-base-content-tertiary);
        border-radius: 6px;
      }
    }

    &::-webkit-scrollbar {
      width: 4px;

      &-track {
        margin-bottom: calc(var(--s-size-small) * 0.25);
      }
    }
  }
}

.preview-image-create-nft {
  margin: #{$basic-spacing-medium} 0;
  height: 200px;

  @include drag-drop-content;

  .image {
    margin: 0 auto;
    height: 176px;
  }

  &__content {
    height: 176px;
    width: 176px;
    object-fit: cover;
    border-radius: calc(var(--s-border-radius-mini) * 0.75);
  }
}

.delimiter {
  background-color: var(--s-color-base-border-secondary);
  margin-bottom: calc(var(--s-size-small) / 2);
  height: 1px;
}
</style>
