<template>
  <div />
</template>
<script>
export default {
  middleware ({ redirect }) {
    redirect('/home')
  },

  layout: 'business',
  head () {
    return {
      title: this.$t('pages.profile')
    }
  }
}
</script>
