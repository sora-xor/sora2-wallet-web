<template>
  <a class="external-link" :class="defaultClass" :href="href" target="_blank" rel="nofollow noopener">
    <span>{{ title }}</span>
  </a>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class ExternalLink extends Vue {
  @Prop({ default: '', type: String }) title!: string;
  @Prop({ default: '', type: String }) href!: string;
  @Prop({ default: 'p4', type: String }) defaultClass!: string;
}
</script>

<style lang="scss" scoped>
.external-link {
  display: inline-block;
  text-decoration: none;
  color: var(--s-color-theme-accent);

  @include focus-outline;
}
</style>
