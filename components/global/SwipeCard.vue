<template>
  <div
    v-swipe="
      patchedActions.length
        ? {
          onSwipe,
          onSwipeEnded,
          captureX: true,
        }
        : false
    "
    class="swipe-card"
    :class="{ 'is-mobile': $mq === 'mobile', 'is-auto-height': autoHeight }"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      class="swipe-card__container"
      :class="[containerClass]"
      :style="{
        backgroundImage: bgImage ? `url(${bgImage})` : '',
        backgroundColor: bgColor,
        marginLeft: swipingDistance ? swipingDistance + 'px' : '',
      }"
    >
      <div
        v-if="patchedActions.length && !isMenuOpened"
        class="swipe-card__menu-toggler"
        :class="[togglerClass]"
        @click.stop="onTogglerClick"
      >
        <base-icon size="25" name="dots-menu" />
      </div>

      <header
        v-if="$slots.header || $slots.title || title"
        class="flex-shrink-0 w-full mb-1"
        :class="{ 'pr-5': !!patchedActions.length }"
      >
        <slot name="header">
          <h3
            v-if="title || $slots.title"
            v-auto-resize-text="{ tooltipOnly: true }"
            class="swipe-card__title"
          >
            <slot name="title">
              {{ title }}
            </slot>
          </h3>
        </slot>
      </header>

      <main class="flex-grow flex-shrink-0" :class="[bodyClass]">
        <slot v-bind="{ isMenuOpened }" />
      </main>

      <footer
        v-if="$slots.footer"
        class="flex items-end justify-between flex-shrink-0 mt-1"
      >
        <slot name="footer" />
      </footer>
    </div>

    <div
      v-if="patchedActions.length"
      ref="actions"
      class="swipe-card__actions"
      :class="{ 'flex-col': !horizontalActions }"
      @mousedown.stop
      @touchstart.stop
    >
      <div
        v-for="action in patchedActions"
        :key="action.icon"
        v-tippy="action.tooltip || false"
        class="swipe-card__actions__item"
        :style="{
          backgroundColor:
            action.bgColor ||
            (action.danger
              ? '#f53232'
              : action.secondary
                ? '#cacaca'
                : '#f1f1f1'),
          color: action.color || action.danger ? '#fff' : '',
        }"
        @click="action.handler && action.handler()"
      >
        <base-icon>{{ action.icon }}</base-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SwipeCard',
  inheritAttrs: false,
  props: {
    hideRemove: Boolean,
    hideEdit: Boolean,
    hideActions: Boolean,
    disabled: Boolean,
    autoHeight: Boolean,
    horizontalActions: Boolean,
    title: { type: String, default: '' },
    bodyClass: { type: String, default: '' },
    containerClass: { type: String, default: '' },
    bgImage: { type: String, default: '' },
    bgColor: { type: String, default: '' },
    // If not empty override the default actions, hideRemove and hideEdit will be ignored
    actions: { type: Array, default: () => [] },
    togglerClass: { type: String, default: '' }
  },
  data () {
    return {
      isMenuOpened: false,
      swipingDistance: 0
    }
  },
  computed: {
    patchedActions () {
      if (this.disabled || this.hideActions) {
        return []
      } else if (this.actions.length) {
        return this.actions
      }

      const actions = []
      if (!this.hideRemove) {
        actions.push({
          icon: 'bin',
          danger: true,
          color: '#fff',
          handler: () => this.$emit('remove')
        })
      }
      if (!this.hideEdit) {
        actions.push({
          icon: 'pen',
          handler: () => this.$emit('edit')
        })
      }

      return actions
    }
  },
  watch: {
    isMenuOpened (val) {
      if (val === true) {
        this.$emit('opened')
      } else {
        this.$emit('closed')
      }
    }
  },
  methods: {
    onTogglerClick () {
      this.showActions()
    },
    showActions () {
      this.isMenuOpened = true
      this.swipingDistance = -(this.$refs.actions?.offsetWidth || 60)
      setTimeout(() => {
        document.addEventListener('click', this.closeActions, {
          capture: true
        })
        document.addEventListener('touchend', this.closeActions, {
          capture: true
        })
      })
    },
    closeActions () {
      this.isMenuOpened = false
      this.swipingDistance = 0
      document.removeEventListener('click', this.closeActions, {
        capture: true
      })
      document.removeEventListener('touchend', this.closeActions, {
        capture: true
      })
    },
    onSwipe ({ x }) {
      const width = this.$refs.actions?.offsetWidth || 60
      this.swipingDistance = this.isMenuOpened
        ? Math.max(0, Math.min(x, width)) - width
        : Math.max(-width, Math.min(x, 0))
    },
    onSwipeEnded ({ towardLeft, x }) {
      if (towardLeft && x < -10) {
        this.showActions()
      } else {
        this.closeActions()
      }
    }
  }
}
</script>

<style lang="scss">
.swipe-card {
  opacity: 0.8;
  min-height: 150px;
  min-width: 200px;
  @apply flex text-white overflow-hidden max-w-full rounded-10px;

  &.is-mobile {
    width: 100%;
  }

  &.is-auto-height {
    @apply min-h-auto;
  }

  &__title {
    font-size: 19px;
    @apply font-bold text-white cursor-default;
  }

  &__container {
    @apply flex flex-col bg-darkred relative w-full min-w-full p-4 bg-cover bg-center bg-no-repeat duration-300 ease-in-out;
  }

  &__menu-toggler {
    right: 10px;
    top: 15px;
    @apply absolute cursor-pointer;

    .base-icon {
      @apply pointer-events-none;
    }
  }

  &__actions {
    background: gray;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    @apply flex flex-shrink-0 justify-around text-black overflow-hidden;

    &__item {
      @apply w-15 min-w-15 flex-1 flex items-center justify-center cursor-pointer text-black text-xl min-h-12;
    }
  }
}
</style>
