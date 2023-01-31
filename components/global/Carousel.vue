<template>
  <div v-if="items" ref="container" class="base-carousel">
    <template v-if="items.length">
      <div v-show="leftNavState" class="base-carousel__nav base-carousel__nav--left" @click="scrollGroup(-1)">
        <base-icon name="chevron-left" />
      </div>

      <div v-show="rightNavState" class="base-carousel__nav base-carousel__nav--right" @click="scrollGroup(+1)">
        <base-icon name="chevron-right" />
      </div>
    </template>

    <base-scroll ref="scroll" scroll-on-drag class="pb-4">
      <div
        ref="body"
        class="base-carousel__body"
        :class="[bodyClass]"
        :style="{
          '--cols': cols,
          'grid-gap': gap,
          'grid-auto-columns': `calc((100% + ${gap}) / var(--cols) - ${gap})`
        }"
      >
        <div
          v-for="(item, i) in items || []"
          :key="item._id || item.id || i"
          class="base-carousel__item"
        >
          <slot name="item" :item="item" :index="i" />
        </div>
      </div>
    </base-scroll>
  </div>
</template>

<script>
export default {
  props: {
    items: { type: Array, default: () => [] },
    bodyClass: { type: String, default: '' },
    minItemWidth: { type: Number, default: 220 },
    gap: { type: String, default: '15px' }
  },
  data () {
    return {
      leftNavState: false,
      rightNavState: false,
      cols: ''
    }
  },
  watch: {
    items: 'updateNavState'
  },
  mounted () {
    const $scroll = this.$refs.scroll.$el
    if ($scroll) {
      const debounceCalculate = this.$utils.createDebounce(() => this.calculateCols(), 50)
      const resizeObserver = new ResizeObserver(() => debounceCalculate())
      this.$once('hook:beforeDestroy', () => resizeObserver.disconnect())
      resizeObserver.observe($scroll)
      debounceCalculate()

      const debounceUpdateNav = this.$utils.createDebounce(() => this.updateNavState(), 50)
      $scroll.addEventListener('scroll', debounceUpdateNav)
    }
  },
  methods: {
    scrollGroup (step) {
      const $scroll = this.$refs.scroll.$el
      if (!$scroll) {
        return
      }

      const $items = Array.from($scroll.querySelectorAll('.base-carousel__item'))
      const threshold = $scroll.scrollLeft + $scroll.clientWidth * step
      const $newFirstVisibleItem = $items.find($item => $item.offsetLeft >= threshold - 100) ||
        (step > 0 ? $items[$items.length - 1] : $items[0])

      if (!$newFirstVisibleItem) {
        return
      }

      this.scrollHorizontally(this.$refs.scroll.$el, $newFirstVisibleItem.offsetLeft)
    },

    calculateCols () {
      if (!this.$refs.scroll) {
        return
      }
      const $scroll = this.$refs.scroll.$el

      this.cols = Math.max(1, Math.floor($scroll.clientWidth / this.minItemWidth))
      this.updateNavState()
    },

    updateNavState () {
      this.$nextTick(() => {
        const $scroll = this.$refs.scroll.$el
        if ($scroll) {
          this.leftNavState = $scroll.scrollLeft > 0
          this.rightNavState = $scroll.scrollLeft + $scroll.clientWidth < $scroll.scrollWidth
        }
      })
    },

    scrollHorizontally (el, scrollTo = 0, duration = 500) {
      const { scrollLeft } = el
      const pixels = scrollTo - scrollLeft
      const startTime = 'now' in window.performance ? performance.now() : new Date().getTime()
      function scroll (timestamp) {
        const timeElapsed = timestamp - startTime
        const progress = Math.min(timeElapsed / duration, 1)
        el.scrollLeft = scrollLeft + pixels * progress
        return timeElapsed < duration && window.requestAnimationFrame(scroll)
      }
      window.requestAnimationFrame(scroll)
    }
  }
}
</script>

<style lang="scss">
.base-carousel {
  position: relative;

  &__nav {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 25px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 22px;
    user-select: none;
    transition: .2s;

    @apply text-gray-750;

    svg {
      color: rgba(236, 236, 236, 0.9)
    }

    &:hover {
      @apply text-black;
    }

    &--left {
      right: 100%;
    }

    &--right {
      left: 100%;
    }
  }

  &__body {
    --cols: 2;

    @media (min-width: 945px) {
      --cols: 3;
    }
    @media (min-width: 1165px) {
      --cols: 4;
    }
    @media (min-width: 1385px) {
      --cols: 5;
    }
    @media (min-width: 1407px) {
      --cols: 4;
    }
    @media (min-width: 1532px) {
      --cols: 5;
    }
    @media (min-width: 1760px) {
      --cols: 6;
    }

    display: grid;
    grid-auto-flow: column;
    grid-template-rows: minmax(120px, 1fr);
  }
}
</style>
