<template>
  <cw-page-container
    :bg-image="$auth.bgImage"
    body-class="layout--auth__body"
    class="layout--auth"
  >
    <Nuxt />
  </cw-page-container>
</template>

<script>
export default {
  computed: {
    bgImage () {
      const bg = !this.$auth.isAuthenticated
        ? null
        : this.$mq === 'mobile'
          ? this.$auth.user?.background?.portrait
          : this.$auth.user?.background?.landscape

      return bg || '/images/sample/bg-user.jpeg'
    }
  }
}
</script>

<style lang="scss">
.layout--auth {
  background: #262626;
  overflow: auto;

  &__body {
    justify-content: center;
    align-items: center;
    overflow: unset!important;
  }
}
</style>
