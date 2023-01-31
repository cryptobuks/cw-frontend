<template>
  <div class="p-6 text-center text-white">
    <h1
      class="text-3xl text-gray-100 mb-3"
      v-html="$t('install_pwa.access_your_app')"
    />

    <p class="text-lg text-gray-500">
      {{ $t('install_pwa.powered_by') }}
    </p>

    <p
      class="inline-block text-center text-3xl font-semibold leading-snug mt-16 md:mt-24"
      v-html="$t('install_pwa.thank_you')"
    />
  </div>
</template>

<script>
export default {
  layout: 'auth',
  auth: false,
  created () {
    if (this.$pwa.isStandalone) {
      setTimeout(() => this.$router.replace('/'), 5000)
    }
  },
  head () {
    return {
      title: this.$t('install_pwa.access_your_app')
    }
  }
}
</script>
