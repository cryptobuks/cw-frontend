<template>
  <div
    v-show="shown"
    class="fixed inset-0 z-100 bg-black bg-opacity-50 flex justify-center items-center p-6 md:p-10 lg:p-20 xl:p-32"
    @click.self="shown = false"
  >
    <div class="relative inline-flex text-base md:text-xl lg:text-2xl xl:text-4xl text-white min-w-64 min-h-64">
      <template v-for="(src, i) in images">
        <img
          :key="src"
          :src="src"
          class="max-w-full max-h-full rounded object-cover"
          :class="{ 'absolute w-0 h-0 opacity-0': i !== activeIndex }"
        >
      </template>

      <template v-if="images.length > 1">
        <div
          class="inline-block p-2 md:p-4 lg:p-8 xl:p-12 absolute right-full top-1/2 cursor-pointer transform -translate-y-1/2"
          @click.stop="incActiveIndex(-1)"
        >
          <base-icon name="chevron-left" class="text-white" />
        </div>

        <div
          class="inline-block p-2 md:p-4 lg:p-8 xl:p-12 absolute left-full top-1/2 cursor-pointer transform -translate-y-1/2"
          @click.stop="incActiveIndex(1)"
        >
          <base-icon name="chevron-right" class="text-white" />
        </div>
      </template>

      <base-icon
        name="dismiss"
        class="top-0 left-full ml-4 md:ml-8 lg:ml-12 cursor-pointer absolute text-base md:text-lg lg:text-xl"
        @click="shown = false"
      />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      shown: false,
      images: [],
      activeIndex: 0
    }
  },
  methods: {
    // [{ imageId, filename }]
    show (productItemPictures) {
      if (productItemPictures.length) {
        this.activeIndex = 0
        this.images = productItemPictures.map(p => this.$utils.getFileUrl(p.imageId, p.filename))
        this.shown = true
      }
    },

    incActiveIndex (inc) {
      const len = this.images.length
      this.activeIndex = Math.min(len - 1, (len + this.activeIndex + inc) % len)
    }
  }
}
</script>
