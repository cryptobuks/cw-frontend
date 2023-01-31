<template>
  <div>...loading</div>
</template>

<script>
export default {
  mounted () {
    this.$router.replace('/home' + location.search)
  }
}
</script>

<style>
</style>
