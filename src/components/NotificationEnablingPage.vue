<template>
  <div class="notification-enabling-pointer">
    <div class="notification-enabling-pointer__instructions">
      <div class="notification-enabling-pointer__text">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class NotificationEnablingPage extends Vue {}
</script>

<style lang="scss">
.notification-enabling-pointer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  position: fixed;

  top: 0;
  left: 0;
  z-index: 90;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: 0.9;
  z-index: 3000;

  &__instructions {
    display: flex;
    position: relative;
  }

  &__text {
    position: relative;
    color: #fff;
    font-size: 19px;
  }

  &__text::before {
    content: '';
    background: url('data:image/png;base64,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')
      no-repeat;
    width: 100%;
    height: 300px;
    position: absolute;
    top: -185px;
  }
}
</style>
