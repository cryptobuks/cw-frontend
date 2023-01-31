<template>
  <div class="flex items-center">
    <div class="rounded-full h-4 w-4" :style="{ backgroundColor: color }" />
    <span class="ml-4">{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: 'ColorIndicator',
  props: {
    color: { type: String, required: true },
    text: { type: String, default: '' }
  }
}
</script>

<style>
</style>
