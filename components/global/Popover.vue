<template>
  <div
    v-show="!!$scopedSlots.activator"
    ref="activator"
    @click="showOnClick && toggle()"
    @keydown.stop="onActivatorKeyDown"
    @focusin="onActivatorFocus"
    @mouseover="mount"
  >
    <slot
      name="activator"
      :active="shown"
      :show="() => show()"
    />

    <base-transition ref="body" active name="fade">
      <div
        v-show="shown"
        v-click-away="shown ? hide : false"
        class="base-popover__body"
        @click="onBodyClick"
      >
        <slot v-if="shown || keepAlive" :active="shown" :hide="hide" />
      </div>
    </base-transition>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core'
export default {
  inheritAttrs: false,
  model: {
    prop: 'active',
    event: 'active-change'
  },
  props: {
    active: Boolean,

    disabled: Boolean,

    showOnClick: { type: Boolean, default: true },

    // Whether should hide when the body is clicked
    hideOnClick: Boolean,

    // Render popover body slot even when the popover is hidden
    keepAlive: Boolean,

    // https://popper.js.org/docs/v2/constructors/#placement
    placement: { type: String, default: 'bottom-start' },

    // https://popper.js.org/docs/v2/modifiers/offset/
    offsetX: { type: Number, default: 0 },
    offsetY: { type: Number, default: 0 },

    // https://popper.js.org/docs/v2/modifiers/flip/#boundary
    boundary: { type: [HTMLElement, String], default: null },

    showOnFocus: Boolean,

    matchActivatorWidth: Boolean,

    strategy: { type: String, default: 'fixed' },

    mountOnFocus: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      shown: !!this.active,
      popper: null,
      timeout: null
    }
  },
  watch: {
    active (v) {
      this.shown = !!v
      this.toggle(this.shown)
    },
    placement (placement) {
      this.popper && this.popper.setOptions({
        placement
      })
    }
  },
  mounted () {
    if (!this.mountOnFocus) {
      this.mount()
    }
  },
  beforeDestroy () {
    if (this.popper) {
      this.popper.destroy()
      document.body.removeChild(this.$refs.body.$el)
    }
  },
  methods: {
    mount () {
      if (this.$refs.activator && this.$refs.body?.$el && !this.popper) {
        document.body.appendChild(this.$refs.body.$el)

        const modifiers = [
          {
            name: 'offset',
            options: { offset: [this.offsetX, this.offsetY] }
          }
        ]

        if (this.strategy === 'absolute') {
          modifiers.push({
            name: 'computeStyles',
            enabled: false
          })
        }

        if (this.matchActivatorWidth) {
          modifiers.push({
            name: 'matchActivatorWidth',
            enabled: true,
            fn: ({ state }) => {
              state.styles.popper.width = `${state.rects.reference.width}px`
            },
            phase: 'beforeWrite',
            requires: ['computeStyles']
          })
        }

        if (this.boundary) {
          const boundary = this.boundary instanceof HTMLElement
            ? this.boundary
            : document.querySelector(this.boundary)

          if (boundary instanceof HTMLElement) {
            modifiers.push({
              name: 'flip',
              options: { boundary }
            })
          }
        }

        this.popper = createPopper(this.$refs.activator, this.$refs.body.$el, {
          placement: this.placement,
          modifiers,
          strategy: this.strategy
        })
      }
    },
    toggle (shown) {
      if (this.disabled || shown === this.shown) {
        return
      }

      if (!this.shown) {
        this.show()
      } else {
        this.hide()
      }
    },

    show () {
      if (this.disabled || this.shown) {
        return
      }

      setTimeout(async () => {
        this.shown = true
        this.$emit('active-change', true)
        if (this.popper) {
          await this.popper.setOptions({
            scroll: true,
            resize: true
          })

          this.popper.update()
        }
      })
    },

    hide () {
      this.popper && this.popper.setOptions({
        scroll: false,
        resize: false
      })

      this.shown = false
      this.$emit('active-change', false)

      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
    },

    onActivatorFocus (e) {
      if (this.showOnFocus) {
        // Focus event fire before toggle is called making the popover hide right after
        // it is shown. Thus need a timeout to make sure toggle is called first
        this.timeout = setTimeout(() => {
          this.show()
          this.timeout = null
        }, 200)
      }
    },

    onActivatorKeyDown (e) {
      switch (e.keyCode) {
        case 13: // Enter
        case 38: // Up
        case 40: // Down
          this.show()
          break
        case 9: // Tab
        case 27: // ESC
          this.hide()
          break
      }

      this.$emit('activator-keydown', e, { active: this.shown })
    },

    onBodyClick (e) {
      if (this.hideOnClick) {
        this.hide()
      } else {
        e.stopPropagation()
      }
    }
  }
}
</script>

<style lang="scss">
.base-popover {
  &__body {
    z-index: 100;
  }
}
</style>
