<template>
  <div
    class="cw-page-container"
    :class="{ 'is-mobile': $mq === 'mobile' }"
  >
    <div
      class="cw-page-container__bg"
      :style="{
        backgroundImage: `url(${$auth.bgImage()})`
      }"
    />

    <header v-if="$slots.header" class="cw-page-container__header">
      <slot name="header" />
    </header>

    <main class="cw-page-container__body" :class="[bodyClass, $route.name !== 'login' && $auth.isUser() ? 'full-page' : null]">
      <slot />
    </main>

    <template v-if="hasModals">
      <cw-push-subscription-modal v-if="hasPush" @done="hasPush = !hasCompletion && !hasPwa" />
      <cw-profile-completion-modal v-if="hasCompletion" :ready="!hasPush" allow-not-show-again @done="hasCompletion = !hasPwa" />
      <cw-install-pwa-modal v-if="!hasCompletion && !hasPush && hasPwa" />
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    bodyClass: { type: String, default: '' }
  },
  data () {
    const isUser = this.$auth.isUser()
    const isCompany = this.$auth.user?.typeCode === 'CO'
    const isImpseronating = !!this.$auth.user?.roles?.length
    const path = this.$route.path
    return {
      hasModals: isUser && !path.startsWith('/device') && !path.startsWith('/login'),
      hasCompletion: isUser,
      hasPush: isUser,
      hasPwa: isUser && !isCompany && !isImpseronating && !this.$pwa.isStandalone
    }
  }
}
</script>

<style lang="scss">
.cw-page-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Fallback for browsers that do not support Custom Properties */
  height: calc(var(--vh, 1vh) * 100);
  @apply bg-transparent;

  &.is-mobile {
    flex-direction: column-reverse;

    .cw-page-container__body {
      padding: 0;
    }
  }

  &__bg {
    @apply fixed inset-0 bg-cover bg-center bg-fixed pointer-events-none -z-1;

    &::after {
      content: "";
      @apply block absolute inset-0 bg-gray-800 bg-opacity-25;
    }
  }

  &__header, &__body {
    width: 100%;
    max-width: 1920px;
    margin: auto;
  }

  &__header {
    position: relative;
    z-index: 100;
  }

  &__body {
    flex: 1;
    display: flex;
    padding: 10px;
    overflow: hidden;

    &.full-page {
      padding: 0;
    }
  }
}
</style>
