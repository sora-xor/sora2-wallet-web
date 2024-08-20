<template>
  <s-input
    ref="input"
    :type="type"
    :placeholder="t('desktop.password.placeholder')"
    v-model="query"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <s-icon v-button :name="icon" class="eye-icon" size="18" slot="suffix" @click.native="togglePasswordVisibility" />
  </s-input>
</template>

<script lang="ts">
import { Component, Mixins, ModelSync } from 'vue-property-decorator';

import InputFocusMixin from '../mixins/InputFocusMixin';
import TranslationMixin from '../mixins/TranslationMixin';

@Component
export default class PasswordInput extends Mixins(InputFocusMixin, TranslationMixin) {
  @ModelSync('value', 'input', { type: String })
  readonly query!: string;

  hidden = true;

  get icon(): string {
    return this.hidden ? 'basic-eye-no-24' : 'basic-filterlist-24';
  }

  get type(): string {
    return this.hidden ? 'password' : 'text';
  }

  togglePasswordVisibility(): void {
    this.hidden = !this.hidden;
  }

  reset(): void {
    this.hidden = true;
  }
}
</script>
