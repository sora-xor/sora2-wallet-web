<template>
  <s-card v-bind="{ shadow: 'always', size: 'small', borderRadius: 'medium', ...$attrs }" class="wallet-account">
    <div class="account s-flex">
      <div class="account-avatar">
        <slot name="avatar" />
      </div>
      <div class="account-details s-flex">
        <div class="account-credentials s-flex">
          <div class="account-credentials_name">
            <slot name="name" />
          </div>
          <div class="account-credentials_description">
            <slot name="description" />
          </div>
        </div>
        <slot />
      </div>
    </div>
  </s-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class AccountCard extends Vue {}
</script>

<style lang="scss">
.account {
  &-details {
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>

<style scoped lang="scss">
$avatar-margin-right: #{$basic-spacing-small};
$avatar-size: 32px;

.wallet-account.s-card {
  border: 1px solid transparent;
}

.account {
  align-items: center;

  &-avatar {
    display: flex;
    flex-shrink: 0;
    margin-right: $avatar-margin-right;
    width: $avatar-size;
    height: $avatar-size;
  }

  &-details {
    flex: 1;
    align-items: center;
    width: calc(100% - #{$avatar-size} - #{$avatar-margin-right});
  }

  &-credentials {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;

    &_name,
    &_description {
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: var(--s-letter-spacing-small);
    }

    &_name {
      font-size: var(--s-font-size-medium);
      font-weight: 600;
      line-height: var(--s-line-height-medium);
      outline: none;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &_description {
      @include value-prefix(width, fit-content);
      @include hint-text;
      outline: none;
    }
  }
}
</style>
