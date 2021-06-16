<template>
  <div class="lottie-loader" :style="`width: ${size}; height: ${size};`">
    <lottie-animation path="json/loader.json" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import LottieAnimation from 'lottie-vuejs/src/LottieAnimation.vue'

@Component({
  components: {
    LottieAnimation
  }
})
export default class LottieLoader extends Vue {
  @Prop({ default: '42px', type: String }) readonly size!: string
}
</script>

<style lang="scss">
$lottie-loader-class: '.lottie-loader';
#{$lottie-loader-class} {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  z-index: 1;
}
#{$lottie-loader-class}--loading {
  position: relative;
  &:after {
    border-radius: inherit;
    display: block;
    height: 100%;
    width: 100%;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    background-color: var(--s-color-utility-body);
  }
  #{$lottie-loader-class} {
    display: block;
  }
}
</style>
