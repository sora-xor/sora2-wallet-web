<template>
  <div class="wallet-settings-create-token">
    <template v-if="step === Step.CreateNftToken">
      <s-input
        v-if="false /* TODO: [NFT] fix issues in handleInputLinkChange */"
        :placeholder="linkPlaceholder"
        :minlength="1"
        :maxlength="200"
        :disabled="loading"
        v-model="tokenContentLink"
        @input="handleInputLinkChange"
      />
      <div class="image-upload">
        <s-button class="image-upload__btn">
          <label class="image-upload__label" for="image">{{ t('createToken.selectLocalFile') }}</label>
          <input
            class="image-upload__input"
            ref="fileInput"
            type="file"
            id="image"
            accept="image/*"
            @change="handleFileUpload"
          />
        </s-button>
        <span class="image-upload__filename">{{ formattedFileName }}</span>
      </div>
      <div class="preview-image">
        <div v-if="imageLoading" v-loading="imageLoading" />
        <div v-else-if="!tokenContentLink && !file" class="placeholder">
          <s-icon class="preview-image__icon" name="camera-16" size="64px" />
          <span class="preview-image__placeholder">{{ t('createToken.nft.image.placeholderNoImage') }}</span>
        </div>
        <div v-else-if="badSource && !file" class="placeholder">
          <s-icon class="preview-image__icon" name="basic-clear-X-24" size="64px" />
          <span class="preview-image__placeholder">{{ t('createToken.nft.image.placeholderBadSource') }}</span>
        </div>
        <div v-else class="image">
          <img class="preview-image__content" :src="contentSrcLink" />
          <div @click="clearContent">
            <s-icon class="preview-image__clear-btn" name="basic-clear-X-24" size="64px" />
          </div>
        </div>
      </div>
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
      <s-input
        class="input-textarea"
        type="textarea"
        :placeholder="t('createToken.nft.description.placeholder')"
        :disabled="loading"
        :maxlength="255"
        v-model="tokenDescription"
        @keypress.native="handleTextAreaInput($event)"
      />
      <s-button
        class="wallet-settings-create-token_action s-typography-button--large"
        type="primary"
        :loading="loading"
        :disabled="isCreateDisabled"
        @click="onCreate"
      >
        <template v-if="!tokenContentLink.trim() && !file">{{ t('createToken.provideContent') }}</template>
        <template v-else-if="!tokenName.trim()">{{ t('createToken.enterName') }}</template>
        <template v-else-if="!tokenSymbol">{{ t('createToken.enterSymbol') }}</template>
        <template v-else-if="!tokenDescription">{{ t('createToken.enterTokenDescription') }}</template>
        <template v-else-if="!tokenSupply">{{ t('createToken.enterSupply') }}</template>
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
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import { File as ImageNFT, NFTStorage } from 'nft.storage';
import { FPNumber, Operation } from '@sora-substrate/util';
import { MaxTotalSupply, XOR } from '@sora-substrate/util/build/assets/consts';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

import NftDetails from './NftDetails.vue';
import NetworkFeeWarningDialog from './NetworkFeeWarning.vue';
import InfoLine from './InfoLine.vue';
import WalletFee from './WalletFee.vue';
import TranslationMixin from '../components/mixins/TranslationMixin';
import NetworkFeeWarningMixin from './mixins/NetworkFeeWarningMixin';
import LoadingMixin from '../components/mixins/LoadingMixin';
import TransactionMixin from '../components/mixins/TransactionMixin';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';
import { RouteNames, Step } from '../consts';
import { api } from '../api';
import { shortenValue } from '../util';
import { IpfsStorage } from '../util/ipfsStorage';

@Component({
  components: {
    InfoLine,
    WalletFee,
    NftDetails,
    NetworkFeeWarningDialog,
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
  readonly maxTotalSupply = MaxTotalSupply.substring(0, MaxTotalSupply.indexOf('.'));
  readonly decimals = 0;
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;
  readonly Step = Step;
  readonly XOR_SYMBOL = XOR.symbol;

  @Prop({ default: Step.CreateSimpleToken, type: String }) readonly step!: Step;

  @Getter nftStorage!: NFTStorage;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  imageLoading = false;
  badSource = false;
  contentSrcLink = '';
  tokenContentIpfsParsed = '';
  tokenContentLink = '';
  tokenSymbol = '';
  tokenName = '';
  tokenDescription = '';
  tokenSupply = '';
  linkPlaceholder = this.t('createToken.nft.link.placeholder');
  showFee = true;
  file: Nullable<File> = null;
  fileName = '';

  get isCreateDisabled(): boolean {
    return (
      !(this.tokenSymbol && this.tokenName.trim() && this.tokenSupply && this.tokenDescription.trim()) ||
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

  get formattedFileName(): string {
    return shortenValue(this.fileName);
  }

  get contentSource(): string {
    if (this.file) return this.t('createToken.nft.source.value');
    return IpfsStorage.getStorageHostname(this.tokenContentLink);
  }

  get hasEnoughXor(): boolean {
    return FPNumber.gte(this.xorBalance, this.fee); // xorBalance -> NetworkFeeWarningMixin
  }

  async handleFileUpload(): Promise<void> {
    this.imageLoading = true;
    const fileInput = this.$refs.fileInput as HTMLInputElement;
    if (!(fileInput && fileInput.files)) {
      this.resetFileInput();
      return;
    }
    const file = fileInput.files[0];
    if (!file) {
      this.resetFileInput();
      return;
    }
    this.file = file;
    this.fileName = file.name;
    this.contentSrcLink = await IpfsStorage.fileToBase64(file);
    this.badSource = false;
    this.imageLoading = false;
    this.tokenContentLink = '';
  }

  handleInputLinkChange(link: string): void {
    this.imageLoading = true;
    this.badSource = false;
    this.linkPlaceholder = link
      ? this.t('createToken.nft.link.placeholderShort')
      : this.t('createToken.nft.link.placeholder');

    this.checkImageFromSource(link);
  }

  handleTextAreaInput(e: KeyboardEvent): boolean | void {
    if (/^[A-Za-z0-9 _',.#]+$/.test(e.key)) return true;
    e.preventDefault();
  }

  async checkImageFromSource(url: string): Promise<void> {
    // it's better to use debounce fn. Also, need to fix base url
    try {
      const response = await fetch(url);
      const buffer = await response.blob();
      this.imageLoading = false;

      if (buffer.type.startsWith('image/')) {
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

  clearContent(): void {
    this.tokenContentLink = '';
    this.contentSrcLink = '';
    this.resetFileInput();
  }

  resetFileInput(): void {
    this.file = null;
    this.fileName = '';
    (this.$refs.fileInput as HTMLInputElement).value = '';
    this.imageLoading = false;
  }

  async storeNftImage(file: File): Promise<void> {
    const content = (await IpfsStorage.fileToBuffer(file)) as ArrayBuffer;

    const metadata = await this.nftStorage.store({
      name: file.name,
      description: this.tokenDescription,
      image: new ImageNFT([content], file.name, { type: file.type }),
    });

    this.tokenContentIpfsParsed = IpfsStorage.getIpfsPath(metadata.embed().image.href);
  }

  async registerNftAsset(): Promise<void> {
    return api.assets.register(this.tokenSymbol, this.tokenName.trim(), this.tokenSupply, undefined, {
      isNft: true,
      content: this.tokenContentIpfsParsed,
      description: this.tokenDescription,
    });
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

    if (this.hasEnoughXor && !this.isXorSufficientForNextTx({ type: Operation.RegisterAsset })) {
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
.image-upload {
  &__input {
    display: none;
  }

  &__btn {
    background: var(--s-color-base-content-tertiary) !important;
    margin-top: #{$basic-spacing-medium};
    padding: 0 !important;
  }

  &__label {
    padding: calc(var(--s-size-small) / 2);

    &:hover {
      cursor: pointer;
    }
  }

  &__filename {
    margin-left: 10px;
    font-size: 12px;
  }
}

.info-line-container {
  text-transform: uppercase;
  margin-bottom: calc(var(--s-size-small) / 2);
}
</style>

<style lang="scss">
.wallet-settings-create-token {
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
}

.s-textarea {
  margin-bottom: #{$basic-spacing-medium};
}

.el-textarea {
  height: 54px;
  // margin-top: 6px;

  &__inner {
    resize: none !important;
  }
}

.preview-image {
  display: flex;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  border: 2px dashed var(--s-color-base-content-tertiary);
  border-radius: var(--s-border-radius-small);
  margin: #{$basic-spacing-medium} 0;
  height: 200px;
  position: relative;

  .image {
    margin: 0 auto;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__content {
    height: 176px;
    width: 176px;
    object-fit: cover;
    border-radius: 12px;
  }

  &__icon {
    color: var(--s-color-base-content-tertiary) !important;
    font-size: var(--s-size-small) !important;
    margin-bottom: calc(var(--s-size-small) / 2);
  }

  &__placeholder {
    letter-spacing: var(--s-letter-spacing-small);
    color: var(--s-color-base-content-primary);
    font-weight: 400 !important;
    font-size: calc(var(--s-size-small) / 2);
    text-align: center;
    padding: 0 50px;
  }

  &__clear-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    color: var(--s-color-base-content-tertiary) !important;
    font-size: var(--s-size-small) !important;
    margin-bottom: calc(var(--s-size-small) / 2);
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
