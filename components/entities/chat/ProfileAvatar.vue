<template>
  <div class="relative flex-shrink-0">
    <img
      class="object-cover rounded-full"
      :class="[sizeClass]"
      :src="src"
      :alt="alt"
      draggable="false"
      :style="customStyle"
    >
    <div v-if="isOnline" class="absolute right-0 bottom-0 rounded-full h-3 w-3 bg-green lg:h-4 lg:w-4" />
  </div>
</template>

<script>
export default {
  props: {
    size: { type: Number, default: 12 },
    src: { type: String, default: '' },
    alt: { type: String, default: '' },
    isOnline: Boolean,
    border: { type: String, default: '' }
  },

  computed: {
    sizeClass () {
      return `w-${this.size} h-${this.size}`
    },
    customStyle () {
      if (!this.border) {
        return ''
      }
      return 'border: 1px solid ' + this.border + ';'
    }
  }
}
</script>
