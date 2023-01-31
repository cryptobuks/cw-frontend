<template>
  <div ref="container" class="base-selection-slider" @click="onSliderClick">
    <div
      v-for="item in items"
      :key="item.value"
      class="base-selection-slider__dot"
    />

    <div
      v-if="selectedItem !== undefined"
      ref="thumb"
      v-swipe="{
        onSwipeStart,
        onSwipe,
        onSwipeEnded,
        captureX: true,
      }"
      class="base-selection-slider__thumb"
      :class="[
        selectedItem.danger ? 'bg-red text-white' : 'bg-white text-black',
      ]"
      :style="{
        left: `calc(${thumbLeftPercentages}% + ${swipeOffsetX}px)`,
        transform: `translateX(${translateX * 100}%)`
      }"
    >
      {{ selectedItem.text }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: { type: [String, Number, Boolean], default: false },
    items: { type: Array, default: () => ([]) }
  },
  data () {
    return {
      swipeOffsetX: 0,
      minOffsetX: 0,
      maxOffsetX: 0
    }
  },
  computed: {
    selectedItem () {
      return this.items.find(item => item.value === this.value)
    },
    selectedIndex () {
      return this.items.indexOf(this.selectedItem)
    },

    thumbLeftPercentages () {
      return this.selectedIndex ? this.selectedIndex * 100 / (this.items.length - 1) : 0
    },

    translateX () {
      return this.selectedIndex === 0
        ? 0
        : this.selectedIndex === this.items.length - 1
          ? -1
          : -0.5
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        if (this.items.length && !this.items.some(item => item.value === v)) {
          this.$emit('input', this.items[0].value)
        }
      }
    }
  },
  methods: {
    onSliderClick (e) {
      const mouseX = (e.touches?.[0]?.clientX ?? e.clientX) - e.target.getBoundingClientRect().left
      const i = Math.round(mouseX / (e.target.clientWidth / (this.items.length - 1)))
      if (this.items[i]) {
        this.$emit('input', this.items[i].value)
      }
    },

    onSwipeStart () {
      const thumbWidth = this.$refs.thumb.offsetWidth
      const thumbLeft = this.$refs.thumb.offsetLeft + this.translateX * thumbWidth

      this.minOffsetX = -thumbLeft
      this.maxOffsetX = this.$refs.container.clientWidth - thumbLeft - thumbWidth
    },

    onSwipe ({ x }) {
      this.swipeOffsetX = Math.min(this.maxOffsetX, Math.max(this.minOffsetX, x))
    },

    onSwipeEnded () {
      const offsetLeft = this.$refs.thumb.offsetLeft + this.translateX * this.$refs.thumb.offsetWidth
      const i = Math.round(offsetLeft / (this.$refs.container.clientWidth / (this.items.length - 1)))
      if (this.items[i]) {
        this.$emit('input', this.items[i].value)
      }
      this.swipeOffsetX = 0
    }
  }
}
</script>

<style lang="scss">
.base-selection-slider {
  @apply relative h-6 flex justify-between items-center cursor-pointer overflow-hidden;

  &::before {
    content: "";
    @apply absolute block h-1 bg-gray-500 rounded top-1/2 left-0 right-0 transform -translate-y-1/2;
  }

  &__dot {
    @apply bg-gray-500 rounded-full w-2 h-2 pointer-events-none;
  }

  &__thumb {
    transform: translateX(-50%);

    @apply absolute left-0 top-0 bottom-0 inline-flex items-center rounded-lg px-2 text-xs uppercase select-none duration-150;
  }
}
</style>
