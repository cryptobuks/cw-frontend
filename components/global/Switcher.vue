<template>
  <label
    ref="container"
    class="base-switcher"
    :class="{ light }"
    :style="{ minWidth: minWidth + 'px' }"
  >
    <input
      v-model="temp"
      type="checkbox"
      tabindex="-1"
      v-bind="$attrs"
      v-on="{
        ...$listeners,
        input: () => {}
      }"
    >

    <div
      :tabindex="focusable ? '0' : tabindex"
      class="base-switcher__slider"
      :style="{ backgroundColor: light ? color : '#fff' }"
      @keyup.space="temp = !temp"
    >
      <span v-auto-resize-text="{ min: 11, max: 13 }" class="base-switcher__text" :style="{ color: light ? '#fff' : color }">
        {{ text }}
      </span>

      <span class="base-switcher__indicator" :style="{ backgroundColor: light ? '#fff' : color }" />
    </div>
  </label>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: Boolean,
    trueColor: { type: String, default: '#6caa46' },
    falseColor: { type: String, default: '#2f5395' },
    trueText: { type: String, default: '' },
    falseText: { type: String, default: '' },
    tabindex: { type: String, default: '-1' },
    focusable: Boolean,
    light: Boolean
  },
  data () {
    return {
      tempValue: this.value,
      minWidth: 48
    }
  },
  computed: {
    temp: {
      get () {
        return this.tempValue
      },
      set (v) {
        this.tempValue = v
        this.$emit('input', v)
        this.$nextTick(() => this.resetWidth())
      }
    },

    color () {
      return this.temp ? this.trueColor : this.falseColor
    },

    text () {
      return this.temp ? this.trueText : this.falseText
    }
  },
  watch: {
    value (v) {
      this.tempValue = v
    }
  },
  mounted () {
    this.resetWidth()
  },
  methods: {
    resetWidth () {
      if (this.$refs.container) {
        const styles = window.getComputedStyle(this.$refs.container)
        const width = parseFloat(styles.getPropertyValue('width')) + 1
        if (width > this.minWidth) {
          this.minWidth = width
        }
      }
    }
  }
}
</script>

<style lang="scss">
.base-switcher {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  max-width: 160px;
  min-width: 48px;
  height: 22px;

  &__slider {
    height: 100%;
    width: 100%;
    position: relative;
    display: inline-flex;
    align-items: center;
    background: #fff;
    border-radius: 11px;
    padding-left: 8px;
    padding-right: 22px;
    text-transform: uppercase;
    font-size: 13px;
    transition: .5s;
    max-width: 100%;

    &:focus {
      outline: none;
    }
  }

  &__indicator {
    right: 2px;
    top: 2px;
    bottom: 2px;
    width: 18px;
    height: 18px;
    @apply absolute rounded-1/2 duration-500;
  }

  &__text {
    width: 100%;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 600;
    user-select: none;
  }

  input {
    opacity: 0;
    height: 0;
    width: 0;
    position: absolute;

    &:checked + .base-switcher__slider {
      padding-left: 22px;
      padding-right: 8px;
      text-align: left;

      .base-switcher__indicator {
        right: calc(100% - 20px);
      }
    }
  }
}
</style>
