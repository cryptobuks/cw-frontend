<template>
  <nuxt-child />
</template>

<script>
export default {
  auth: 'business',
  head () {
    return {
      title: this.$t('global.settings')
    }
  }
}
</script>
