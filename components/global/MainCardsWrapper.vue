<template>
  <div class="base-main-cards-wrapper">
    <slot />
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
.base-main-cards-wrapper {
  @apply flex flex-1 overflow-hidden;

  > .base-card:not(.is-mobile) {
    &:not(:last-child) {
      &, .base-card {
        @apply rounded-r-none;

        & > .base-card__main {
          @apply border-r-0;
        }
      }
    }

    &:not(:first-child) {
      &, .base-card {
        @apply rounded-l-none;

        .base-card {
          &__main {
            @apply border-l-0;
          }
        }
      }
    }
  }
}
</style>
