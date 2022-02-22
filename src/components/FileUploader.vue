<template>
  <div
    class="drop-zone"
    :class="dropZoneClass"
    @drop="dropImage"
    @dragenter.prevent
    @dragover.prevent="dragOver"
    @dragleave="dragCancelled"
    @dragend="dragCancelled"
    @click="openFileUpload"
  >
    <slot />
    <div v-if="clearBtnShown" @click="clear">
      <s-icon class="clear-file-input-btn" name="basic-clear-X-24" size="64px" />
    </div>
    <input class="drop-zone__input" ref="fileInput" type="file" :accept="accept" @change="upload" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Ref, Prop } from 'vue-property-decorator';
import LoadingMixin from './mixins/LoadingMixin';
import TranslationMixin from './mixins/TranslationMixin';

const HUNDRED_MB = 100 * 1024 * 1024; // 100MB in bytes

@Component
export default class FileUploader extends Mixins(LoadingMixin, TranslationMixin) {
  /**
   * Boolean check for the external link
   */
  @Prop({ default: false, type: Boolean }) readonly isLinkProvided!: boolean;
  /**
   * Accepted format of files. `image/*` is set by default
   */
  @Prop({ default: 'image/*', type: String }) readonly accept!: string;
  /**
   * Limit (in bytes) of the file. 100 MB is set by default.
   */
  @Prop({ default: HUNDRED_MB, type: Number }) readonly limit!: number;

  @Ref('fileInput') readonly fileInput!: HTMLInputElement;

  private isImgDraggedOver = false;
  private isClearBtnShown = false;

  get dropZoneClass(): string {
    return this.isImgDraggedOver || this.isLinkProvided ? 'drop-zone--over' : '';
  }

  get clearBtnShown(): boolean {
    return this.isClearBtnShown || this.isLinkProvided;
  }

  dropImage(event: DragEvent): void {
    event.preventDefault();
    if (!event.dataTransfer) {
      this.resetFileInput();
      return;
    }

    const file = event.dataTransfer.files[0];

    if (!file) {
      this.resetFileInput();
      return;
    }

    if (file.size > this.limit) {
      this.dragCancelled();
      this.$emit('showLimit');
      this.resetFileInput();
      return;
    }

    if (file.type.startsWith('image/')) {
      this.fileInput.files = event.dataTransfer.files as FileList;
      this.upload();
      this.isClearBtnShown = true;
    }
  }

  dragOver(): void {
    this.isImgDraggedOver = true;
  }

  dragCancelled(): void {
    this.isImgDraggedOver = false;
  }

  openFileUpload(): void {
    if ((this.fileInput.files as FileList)[0] || this.isLinkProvided) {
      return;
    }
    this.fileInput.click();
  }

  upload(): void {
    if (!(this.fileInput && this.fileInput.files)) {
      this.resetFileInput();
      return;
    }

    this.$emit('hide-limit');
    const file = this.fileInput.files[0];

    if (!file) {
      this.resetFileInput();
      return;
    }

    if (file.size > this.limit) {
      this.$emit('show-limit');
      this.resetFileInput();
      return;
    }

    this.$emit('upload', file);
    this.isImgDraggedOver = true;
    this.isClearBtnShown = true;
  }

  clear(e: Event): void {
    e.stopPropagation();
    this.resetFileInput();
    this.$emit('clear');
  }

  resetFileInput(): void {
    this.fileInput.value = '';
    this.isClearBtnShown = false;
    this.isImgDraggedOver = false;
  }
}
</script>

<style lang="scss">
.drop-zone {
  cursor: pointer;
  border: 2px dashed var(--s-color-base-content-tertiary);
  &--over {
    border-style: solid;
    cursor: initial;
  }
  &__input {
    display: none;
  }
}

.clear-file-input-btn {
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
</style>
