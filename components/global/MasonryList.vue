<template>
  <div :ref="`masonry-${_uid}`" class="masonry -ml-4">
    <slot name="items">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="masonry-item"
        :class="[itemClass]"
      >
        <slot v-bind="{ item }" />
      </div>
    </slot>
  </div>
</template>

<script>
import Masonry from 'masonry-layout'

export default {
  props: {
    fitWidth: { type: Boolean, default: true },
    horizontalOrder: { type: Boolean, default: true },
    items: { type: Array, default: () => [] },
    itemClass: { type: String, default: '' }
  },
  data: () => ({ masonry: null }),
  watch: {
    items: {
      immediate: true,
      deep: true,
      handler () {
        this.drawMasonry()
      }
    }
  },
  mounted () {
    const resizeObserver = new ResizeObserver(() => this.drawMasonry())
    resizeObserver.observe(this.$refs[`masonry-${this._uid}`])
    this.drawMasonry()
  },
  updated () {
    this.masonry?.reloadItems()
    this.masonry?.layout()
  },
  methods: {
    drawMasonry () {
      this.masonry = new Masonry(this.$refs[`masonry-${this._uid}`], {
        ...this.$options.props,
        itemSelector: '.masonry-item'
      })
    }
  }
}
</script>

<style>
.masonry {
  width: 100% !important;
}
</style>
