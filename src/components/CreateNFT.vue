<template>
  <div class="wallet-settings-create-token">
    <template v-if="step === Step.CreateNFT">
      <s-input
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
            @change="handleFileUpload"
            ref="fileInput"
            type="file"
            id="image"
            accept="image/*"
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
        :placeholder="t('createToken.nft.name.placeholder')"
        :minlength="1"
        :maxlength="33"
        :disabled="loading"
        v-maska="tokenNameMask"
        v-model="tokenName"
      />
      <p class="wallet-settings-create-token_desc">{{ t('createToken.nft.name.desc') }}</p>
      <s-input
        :placeholder="t('createToken.nft.symbol.placeholder')"
        :minlength="1"
        :maxlength="5"
        :disabled="loading"
        v-maska="tokenSymbolMask"
        v-model="tokenSymbol"
      />
      <p class="wallet-settings-create-token_desc">{{ t('createToken.nft.symbol.desc') }}</p>
      <s-input
        type="textarea"
        :value="String('Description')"
        v-model="tokenDescription"
        :placeholder="t('createToken.nft.description.placeholder')"
        class="input-textarea"
      />
      <s-float-input
        v-model="tokenSupply"
        :placeholder="t('createToken.nft.supply.placeholder')"
        :decimals="decimals"
        has-locale-string
        :delimiters="delimiters"
        :max="maxTotalSupply"
        :disabled="loading"
      />
      <p class="wallet-settings-create-token_desc">{{ t('createToken.nft.supply.desc') }}</p>
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
    <template v-else-if="step === Step.ConfirmNFT">
      <nft-details
        :contentLink="contentSrcLink"
        :tokenName="tokenName"
        :tokenSymbol="tokenSymbol"
        :tokenDescription="tokenDescription"
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
        <template v-if="!hasEnoughXor">{{ t('createToken.insufficientBalance', { symbol: XOR }) }}</template>
        <template v-else>{{ t('createToken.confirm') }}</template>
      </s-button>
    </template>

    <wallet-fee v-if="!isCreateDisabled && showFee" :value="fee" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import NftDetails from './NftDetails.vue';
import TranslationMixin from '../components/mixins/TranslationMixin';
import NetworkFeeWarningDialog from './NetworkFeeWarning.vue';
import NetworkFeeWarningMixin from './mixins/NetworkFeeWarningMixin';
import LoadingMixin from '../components/mixins/LoadingMixin';
import TransactionMixin from '../components/mixins/TransactionMixin';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';
import { RouteNames, Step } from '../consts';
import { FPNumber, MaxTotalSupply, Operation, XOR } from '@sora-substrate/util';
import InfoLine from './InfoLine.vue';
import WalletFee from './WalletFee.vue';
import { api, nftClient, ImageNFT } from '../api';
import { fileToBase64, fileToBuffer, getIpfsPath, getUrlContentSource, shortenFileName } from '../util';

@Component({
  components: {
    InfoLine,
    WalletFee,
    NftDetails,
    NetworkFeeWarningDialog,
  },
})
export default class CreateNFT extends Mixins(
  TranslationMixin,
  TransactionMixin,
  LoadingMixin,
  NumberFormatterMixin,
  NetworkFeeWarningMixin
) {
  readonly tokenSymbolMask = 'AAAAA';
  readonly tokenNameMask = { mask: 'Z*', tokens: { Z: { pattern: /[0-9a-zA-Z ]/ } } };
  readonly maxTotalSupply = MaxTotalSupply;
  readonly decimals = 0;
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;
  readonly Step = Step;
  readonly XOR = XOR;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  @Prop({ default: Step.CreateToken, type: String }) step!: Step;

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
  file: any = null;
  fileName = '';

  get isCreateDisabled(): boolean {
    return (
      !(this.tokenSymbol && this.tokenName.trim() && this.tokenSupply && this.tokenDescription.trim()) || this.badSource
    );
  }

  get fee(): FPNumber {
    return this.getFPNumberFromCodec(this.networkFees.RegisterAsset);
  }

  get formattedFee(): string {
    return this.fee.toLocaleString();
  }

  get formattedFileName(): string {
    return shortenFileName(this.fileName);
  }

  get contentSource(): string {
    if (this.file) return this.t('createToken.nft.source.value');
    return getUrlContentSource(this.tokenContentLink);
  }

  get hasEnoughXor(): boolean {
    const accountXor = api.accountAssets.find((asset) => asset.address === XOR.address);
    if (!accountXor || !accountXor.balance || !+accountXor.balance.transferable) {
      return false;
    }
    const fpAccountXor = this.getFPNumberFromCodec(accountXor.balance.transferable, accountXor.decimals);
    return FPNumber.gte(fpAccountXor, this.fee);
  }

  async handleFileUpload(): Promise<void> {
    this.imageLoading = true;
    const fileInput = this.$refs.fileInput as HTMLInputElement;
    const file = (fileInput.files as FileList)[0];
    if (!file) {
      this.resetFileInput();
      return;
    }
    this.file = file;
    this.fileName = file.name;
    this.contentSrcLink = (await fileToBase64(file)) as string;
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

  async checkImageFromSource(url: string): Promise<void> {
    const response = await fetch(url);
    const buffer = await response.blob();
    this.imageLoading = false;

    if (buffer.type.startsWith('image/')) {
      this.badSource = false;
      this.contentSrcLink = url;
      this.tokenContentIpfsParsed = getIpfsPath(url);
    } else {
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

  resetFileInput() {
    this.file = null;
    this.fileName = '';
    (this.$refs.fileInput as HTMLInputElement).value = '';
    this.imageLoading = false;
  }

  async storeNftImage(file: File): Promise<void> {
    const content = (await fileToBuffer(file)) as ArrayBuffer;

    const metadata = await nftClient.store({
      name: file.name,
      description: this.tokenDescription,
      image: new ImageNFT([content], file.name, { type: file.type }),
    });

    this.tokenContentIpfsParsed = getIpfsPath(metadata.embed().image.href);
  }

  async registerNftAsset(): Promise<void> {
    return api.registerAsset(this.tokenSymbol, this.tokenName.trim(), this.tokenSupply, undefined, {
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
    this.$emit('stepChange', Step.ConfirmNFT);
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
    this.$emit('stepChange', Step.ConfirmNFT);
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
    color: var(--s-color-base-content-secondary);
    font-weight: 400 !important;
    font-size: calc(var(--s-size-small) / 2);
    text-align: center;
    padding: 0 50px;
    color: #2a171f;
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
