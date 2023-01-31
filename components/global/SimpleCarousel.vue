<template>
  <div class="cw-carousel-scroll">
    <a class="scroll-left" style="color: #fff" @click.prevent="scrollLeft">
      <base-icon size="27">
        chevron-left
      </base-icon>
    </a>
    <base-scroll ref="reference" class="cw-carousel-scroll " :class="[isMobileView ? 'vertical' : 'horizontal']" @ps-scroll-x="onScroll">
      <slot />
    </base-scroll>
    <a class="scroll-right" style="color: #fff" @click.prevent="scrollRight">
      <base-icon size="27">
        chevron-right
      </base-icon>
    </a>
  </div>
</template>

<script>
export default {
  name: 'SimpleCarousel',
  data () {
    return {
      scrollX: 0
    }
  },
  computed: {
    isMobileView () {
      return this.$mq === 'mobile'
    }
  },
  methods: {
    scrollRight () {
      const width = this.$refs.reference.$el.scrollWidth - this.$refs.reference.$el.clientWidth
      if (this.scrollX <= width) {
        this.scrollX += 200
        this.$refs.reference.$el.scroll({
          top: 0,
          left: this.scrollX,
          behavior: 'smooth'
        })
      }
    },
    scrollLeft () {
      if (this.scrollX > 0) {
        this.scrollX -= 200
        this.$refs.reference.$el.scroll({
          top: 0,
          left: this.scrollX,
          behavior: 'smooth'
        })
      }
    },
    onScroll (evet) {
      this.scrollX = this.$refs.reference.$el.scrollLeft
    }
  }
}
</script>

<style lang="scss">
  .cw-carousel-scroll {
    width: 100%;
    display: flex;
    &.horizontal {
      max-height: 300px;
      display: flex;
      flex: 1;
      margin-left: 0 !important;
    }

    &.vertical {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .scroll-left,
    .scroll-right {
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
</style>
