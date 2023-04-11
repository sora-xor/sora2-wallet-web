<template>
  <s-card v-bind="{ shadow: 'always', size: 'small', borderRadius: 'medium', ...$attrs }" class="account-card">
    <div class="account">
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
.account-card {
  display: flex;
  align-items: center;

  & > .el-card__body {
    flex: 1;
    max-width: 100%;
  }

  &.s-card.neumorphic {
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
  }
}

.account {
  &-avatar {
    & > img {
      max-width: 100%;
    }
  }
  &-details {
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>

<style scoped lang="scss">
$gap: $basic-spacing-small;
$avatar-size: 32px;

.account {
  display: flex;
  align-items: center;
  gap: $gap;

  &-avatar {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: $avatar-size;
    height: $avatar-size;
    border-radius: 50%;
    overflow: hidden;
  }

  &-details {
    flex: 1;
    align-items: center;
    max-width: calc(100% - $gap - $avatar-size);
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
