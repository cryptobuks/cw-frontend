<template>
  <iframe
    :src="`https://maps.google.com/maps?q=${address}&t=&z=13&ie=UTF8&iwloc=&output=embed`"
    frameborder="0"
    scrolling="no"
    marginheight="0"
    marginwidth="0"
  />
</template>

<script>
export default {
  props: {
    address: { type: String, required: true }
  }
}
</script>

<style>
</style>
