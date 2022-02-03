<template>
  <div
    @drop="dropImage"
    @dragenter.prevent
    @dragover.prevent="dragOver"
    @dragleave="dragCancelled"
    @dragend="dragCancelled"
    @click="openFileUpload"
    class="drop-zone"
    :class="dropZoneClass"
  >
    <slot />
    <div v-if="clearBtnShown" @click="clearContent">
      <s-icon class="clear-file-input-btn" name="basic-clear-X-24" size="64px" />
    </div>
    <input class="drop-zone__input" ref="fileInput" type="file" accept="image/*" @change="handleFileUpload" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Ref, Prop } from 'vue-property-decorator';
import LoadingMixin from './mixins/LoadingMixin';
import TranslationMixin from './mixins/TranslationMixin';

@Component
export default class UploadNftImage extends Mixins(LoadingMixin, TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly isLinkProvided!: boolean;

  @Ref('fileInput') readonly fileInput!: HTMLInputElement;

  isImgDraggedOver = false;
  isClearBtnShown = false;

  get dropZoneClass(): string {
    return this.isImgDraggedOver || this.isLinkProvided ? 'drop-zone--over' : '';
  }

  get clearBtnShown(): boolean {
    return this.isClearBtnShown || this.isLinkProvided;
  }

  dropImage(event): void {
    event.preventDefault();

    if (event.dataTransfer.files[0].type.startsWith('image/')) {
      this.fileInput.files = event.dataTransfer.files;
      this.handleFileUpload();
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

  handleFileUpload(): void {
    if (!(this.fileInput && this.fileInput.files)) {
      this.resetFileInput();
      return;
    }

    const file = this.fileInput.files[0];
    if (!file) {
      this.resetFileInput();
      return;
    }
    this.$emit('handleFileUpload', file);
    this.isImgDraggedOver = true;
    this.isClearBtnShown = true;
  }

  clearContent(e: Event): void {
    e.stopPropagation();
    this.resetFileInput();
    this.$emit('clearContent');
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
