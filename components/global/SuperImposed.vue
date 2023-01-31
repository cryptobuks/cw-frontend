<template>
  <div class="relative">
    <img src="/icons/Performance index.svg" alt="" srcset="">
    <img
      src="/icons/Pointer.svg"
      alt=""
      srcset=""
      class="cursor"
      :style="getProgress"
    >
  </div>
</template>
<script>
export default {
  props: {
    status: {
      type: null,
      required: true
    }
  },
  computed: {
    getProgress () {
      const transform = Math.ceil((this.status / 100) * 180)
      return {
        transform: `rotate(${transform}deg) translate(-50%, -50%)`
      }
    }
  }
}
</script>
<style scoped>
.cursor {
  position: absolute;
  bottom: 10px;
  right: 37%;
  height: 5px;
}
</style>
