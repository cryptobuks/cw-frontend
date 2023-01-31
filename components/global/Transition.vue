<template>
  <transition :name="name" v-bind="$attrs">
    <slot v-if="shown" />
  </transition>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    active: Boolean,
    name: { type: String, default: 'fade' },
    delay: { type: Number, default: 0 }
  },
  data () {
    return {
      shown: this.active,
      timeout: null
    }
  },
  watch: {
    active (active) {
      if (!this.delay) {
        this.shown = active
      } else {
        if (this.timeout) {
          clearTimeout(this.timeout)
          this.timeout = null
        }

        this.timeout = setTimeout(() => {
          this.shown = this.active
          this.timeout = null
        }, this.delay)
      }
    }
  }
}
</script>

<style lang="scss">
// Slide down
.slide-down {
  &-enter-active, &-leave-active {
    transition: transform .5s ease-out;
  }
  &-enter, &-leave-to {
    transform: translateY(100%);
  }
}

// Zoom center
.zoom-center {
  &-enter-active, &-leave-active {
    transition: transform .5s ease-out;
  }
  &-enter, &-leave-to {
    transform-origin: center center;
    transform: scale(0);
  }
}

// Fade
.fade {
  &-enter-active, &-leave-active {
    transition: opacity .3s;
  }
  &-enter, &-leave-to {
    opacity: 0;
  }
}
</style>
