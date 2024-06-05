<template>
  <div :class="['settings-option', { disabled }]">
    <label :class="['settings-option-label', { disabled }]">
      <s-switch v-model="model" :disabled="disabled" />
      <div :class="['settings-option-label-description', { hint: withHint }]">
        <span class="settings-option-label-title">{{ title }}</span>
        <span v-if="withHint" class="settings-option-label-hint">{{ hint }}</span>
      </div>
    </label>
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, ModelSync, Prop, Vue } from 'vue-property-decorator';

@Component
export default class AccountSettingsOption extends Vue {
  @Prop({ default: '', type: String }) readonly hint!: string;
  @Prop({ default: '', type: String }) readonly title!: string;
  @Prop({ default: false, type: Boolean }) readonly disabled!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withHint!: boolean;

  @ModelSync('value', 'input', { type: Boolean })
  readonly model!: boolean;
}
</script>

<style lang="scss" scoped>
.settings-option {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-medium;
  width: 100%;

  &.disabled {
    opacity: 0.6;
  }
}

.settings-option-label {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: $basic-spacing-medium;

  &:not(.disabled) {
    cursor: pointer;
  }

  &-description {
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    font-size: var(--s-font-size-medium);
    font-weight: 300;

    &.hint {
      font-size: var(--s-font-size-small);
    }
  }

  &-title {
    color: var(--s-color-base-content-primary);
  }

  &-hint {
    color: var(--s-color-base-content-secondary);
    font-size: var(--s-font-size-extra-small);
  }
}
</style>
