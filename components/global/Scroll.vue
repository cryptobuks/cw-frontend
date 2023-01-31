<template>
  <perfect-scrollbar
    v-if="$mq !== 'mobile'"
    ref="body"
    v-swipe="scrollOnDrag ? {
      onSwipe,
      onSwipeEnded,
      captureBoth: true,
      mobile: false
    } : false"
    class="base-scroll"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </perfect-scrollbar>

  <div v-else class="base-scroll">
    <slot />
  </div>
</template>

<script>
import { PerfectScrollbar } from 'vue2-perfect-scrollbar'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'
export default {
  name: 'BaseScroll',
  components: {
    PerfectScrollbar
  },
  inheritAttrs: false,
  props: {
    // Enable using mouse drag to scroll
    scrollOnDrag: Boolean
  },
  data () {
    return {
      tmp: null
    }
  },
  methods: {
    onSwipe ({ x, y }) {
      const $body = this.$refs.body.$el
      if (!this.tmp) {
        this.tmp = {
          scrollTop: $body.scrollTop,
          scrollLeft: $body.scrollLeft
        }
      }

      $body.scrollTop = Math.min($body.scrollHeight, Math.max(0, this.tmp.scrollTop - y))
      $body.scrollLeft = Math.min($body.scrollWidth, Math.max(0, this.tmp.scrollLeft - x))
    },
    onSwipeEnded () {
      this.tmp = null
    }
  }
}
</script>

<style lang="scss">
.base-scroll {
  overflow: auto;

  & > .ps__rail-x,
  & > .ps__rail-y {
    background: none!important;
    z-index: 1000;
  }
}
</style>
