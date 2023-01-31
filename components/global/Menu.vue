<template>
  <base-popover
    ref="popover"
    class="base-menu"
    hide-on-click
    v-bind="$attrs"
    v-on="{
      ...$listeners,
      'activator-keydown': onActivatorKeyDown,
      'active-change': onPopoverActiveChange,
    }"
  >
    <template v-if="$scopedSlots.activator" #activator="props">
      <slot name="activator" v-bind="props" />
    </template>

    <template #default="props">
      <base-scroll
        v-if="!hidden"
        ref="body"
        class="base-menu__items"
        :class="[bodyClass, light ? 'light' : '']"
      >
        <div
          v-for="(item, index) in items"
          ref="items"
          :key="index"
          class="base-menu__item"
          :class="[
            itemClass,
            tmpActiveIndex === index ? 'base-menu__item--active' : '',
          ]"
          @click="onItemClick(item)"
        >
          <slot name="item" v-bind="{ ...props, item, index }">
            <div v-auto-resize-text="{ min: 12 }" class="base-menu__item__text">
              <slot name="item-text" :index="index" :item="item">
                {{ item }}
              </slot>
            </div>
          </slot>
        </div>

        <div
          v-if="$scopedSlots.footer || $scopedSlots['footer-text']"
          ref="footer"
          key="_footer"
          class="base-menu__footer base-menu__item"
          :class="{
            'base-menu__item--active': tmpActiveIndex === items.length,
          }"
          @click="onFooterClick"
        >
          <slot name="footer" v-bind="props">
            <div v-auto-resize-text="{ min: 12 }" class="base-menu__item__text">
              <slot name="footer-text" />
            </div>
          </slot>
        </div>

        <div v-if="!items.length && $scopedSlots.empty" class="base-menu__empty">
          <slot name="empty" v-bind="props" />
        </div>
      </base-scroll>
    </template>
  </base-popover>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    activeIndex: { type: Number, default: -1 },
    optgroup: { type: Boolean, default: false },
    items: { type: Array, default: () => [] },
    bodyClass: { type: String, default: '' },
    itemClass: { type: String, default: '' },
    light: Boolean
  },

  data () {
    return {
      tmpActiveIndex: this.activeIndex
    }
  },

  computed: {
    hidden () {
      const slots = this.$scopedSlots
      return !this.items.length && !slots.footer && !slots['footer-text'] && !slots.emtpy
    }
  },

  watch: {
    activeIndex (i) {
      this.tmpActiveIndex = i
      this.ensureActiveIndexVisibility()
    }
  },

  methods: {
    show () {
      this.$refs.popover.show()
    },

    hide () {
      this.$refs.popover.hide()
    },

    onItemClick (item) {
      this.$emit('item-click', item)
    },

    onFooterClick () {
      this.$emit('footer-click')
    },

    onActivatorKeyDown (e, { active = false } = {}) {
      if (!active) {
        return
      }

      let captured = true

      switch (e.keyCode) {
        case 13: // Enter
          this.onKeyEnter()
          break
        case 38: // Up
          this.moveActiveIndex(-1)
          break
        case 40: // Down
          this.moveActiveIndex(1)
          break
        default:
          captured = false
          break
      }

      if (captured) {
        e.stopPropagation()
        e.preventDefault()
      }

      this.$emit('activator-keydown', e)
    },

    onKeyEnter () {
      if (
        this.items.length &&
        this.tmpActiveIndex >= 0 &&
        this.tmpActiveIndex < this.items.length
      ) {
        this.onItemClick(this.items[this.tmpActiveIndex])
      } else if (
        this.$refs.footer &&
        this.tmpActiveIndex === this.items.length
      ) {
        this.onFooterClick()
      }
      this.hide()
    },

    moveActiveIndex (step) {
      const max = this.$refs.footer ? this.items.length + 1 : this.items.length

      this.tmpActiveIndex = max ? (max + this.tmpActiveIndex + step) % max : -1

      this.ensureActiveIndexVisibility()
    },

    onPopoverActiveChange (shown) {
      if (shown) {
        this.$emit('shown')

        this.ensureActiveIndexVisibility(true)
      }

      this.$emit('active-change', shown)
    },

    ensureActiveIndexVisibility (top = false) {
      this.$nextTick(() => {
        if (
          !this.$refs.body ||
          this.tmpActiveIndex < 0 ||
          this.tmpActiveIndex >= this.items.length
        ) {
          return
        }

        const $body = this.$refs.body.$el
        const $item = this.$refs.items[this.tmpActiveIndex]
        if ($body.scrollTop > $item.offsetTop || top) {
          $body.scrollTop = $item.offsetTop
        } else if (
          $body.scrollTop + $body.clientHeight <
          $item.offsetTop + $item.offsetHeight
        ) {
          $body.scrollTop = $item.offsetTop + $item.offsetHeight - $body.clientHeight
        }
      })
    }
  }
}
</script>

<style lang="scss">
[data-popper-placement="top"],
[data-popper-placement="top-start"],
[data-popper-placement="top-end"] {
  & > .base-menu__items {
    @apply rounded-t-10px rounded-b-none;

    &.light {
      @apply border-t border-b-0 text-gray-900;
    }
  }
}

.base-menu {
  &__items {
    max-height: 290px;
    min-width: 200px;
    max-width: 100vw;
    font-size: 15px;
    @apply text-opacity-90 rounded-t-none rounded-b-10px;

    &:not(.light) {
      @apply bg-gray-700 text-white;

      .base-menu {
        &__item {
          &:hover {
            color: #fff;
          }

          &--active {
            @apply bg-gray-750;
          }
        }
      }
    }

    &.light {
      @apply bg-white border-l border-r border-b;

      .base-menu {
        &__item {
          &:hover {
            @apply text-black;
          }

          &--active {
            @apply bg-gray-100;
          }
        }
      }
    }
  }

  &__footer {
    background: inherit;
    @apply sticky bottom-0;
  }

  &__item {
    @apply cursor-pointer relative;

    &__text {
      @apply truncate select-none;
    }
  }

  &__empty {
    padding: 5px 10px;
  }
}
</style>
