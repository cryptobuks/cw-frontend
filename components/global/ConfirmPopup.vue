<template>
  <base-transition name="fade" :active="shown">
    <div class="base-confirm" :class="{ 'has-overlay': overlay, 'pointer-events-none': !persistent }">
      <div v-click-away="onClickAway" class="base-confirm__container">
        <header class="base-confirm__header">
          <slot name="title">
            <h4 v-if="title" class="base-confirm__title">
              {{ title }}
            </h4>
          </slot>

          <span v-if="dismissible" class="base-confirm__dismiss" @click="hide(true)">
            <base-icon name="dismiss" size="8" />
          </span>
        </header>

        <main class="base-confirm__main" :class="[bodyClass]">
          <div v-if="icon" class="my-4">
            <base-icon :name="icon" class="text-4xl" />
          </div>

          <slot>
            <p v-if="html" class="base-confirm__text" v-html="html" />

            <p v-else-if="shownText || text" class="base-confirm__text">
              {{ shownText || text }}
            </p>
          </slot>
        </main>

        <footer class="base-confirm__footer" :class="{ 'is-column': fullWidthActions }">
          <base-button
            v-for="({ bold, text: actionText, icon: bIcon, handler, ...buttonProps }, index) in patchedActions"
            :key="index"
            class="base-confirm__action"
            :class="{ 'font-semibold': !!bold }"
            v-bind="buttonProps"
            @click="onActionClick(handler)"
          >
            <base-icon v-if="bIcon" :name="bIcon" class="text-2xl" />

            <template v-if="actionText">
              {{ actionText }}
            </template>
          </base-button>
        </footer>
      </div>
    </div>
  </base-transition>
</template>

<script>
export default {
  model: {
    prop: 'active',
    event: 'active-change'
  },
  props: {
    active: Boolean,
    title: { type: String, default: null },
    dismissible: { type: Boolean, default: true },
    persistent: Boolean,
    text: { type: String, default: null },
    html: { type: String, default: null },
    icon: { type: String, default: null },
    bodyClass: { type: String, default: '' },
    yesText: { type: String, default: 'Yes' },
    noText: { type: String, default: 'No' },
    actions: { type: Array, default: () => [] },
    fullWidthActions: Boolean,
    overlay: Boolean,
    hideActions: Boolean
  },
  data () {
    return {
      shown: this.active,
      callback: null,
      shownActions: null,
      shownText: null
    }
  },
  computed: {
    patchedActions () {
      if (this.shownActions) {
        return this.shownActions
      }

      if (this.hideActions) {
        return []
      }

      if (this.actions.length) {
        return this.actions
      }

      const actions = [
        {
          text: this.noText,
          handler: () => this.$emit('no')
        },
        {
          text: this.yesText,
          handler: () => {
            this.$emit('yes')
            this.callback?.()
          },
          bold: true
        }
      ]

      return actions
    }
  },
  watch: {
    active (shown) {
      this.shown = shown
    }
  },
  methods: {
    async onActionClick (handler) {
      const res = await handler?.()
      this.$emit('action-click', res !== false)
    },

    show ({ done, actions, text } = {}) {
      this.shown = true
      this.callback = done
      this.shownActions = actions
      this.shownText = text
      this.$emit('active-change', true)
    },

    hide (isDismiss) {
      this.shown = false
      this.callback = this.shownActions = this.shownText = null
      this.$emit('active-change', false)
      isDismiss && this.$emit('dismiss')
    },

    onClickAway () {
      if (!this.persistent) {
        this.hide()
      }
    }
  }
}
</script>

<style lang="postcss">
.base-confirm {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  &.has-overlay {
    @apply bg-black bg-opacity-50;
  }

  &__container {
    min-width: 300px;
    max-width: 600px;
    min-height: 200px;
    z-index: 200;
    @apply flex flex-col bg-white text-black overflow-hidden text-base pointer-events-auto rounded-6px;
  }

  &__header {
    flex-shrink: 0;
    position: relative;
    padding: 15px 50px 5px;
  }

  &__title {
    font-size: 20px;
    font-weight: 800;
    text-align: center;
  }

  &__dismiss {
    position: absolute;
    top: 0;
    right: 5px;
    transition: .3s;
    cursor: pointer;
    padding: 15px;
    line-height: 1;
    display: inline-block;

    @apply text-gray-600;

    &:hover {
      @apply text-gray-800;
    }
  }

  &__main {
    padding: 20px 50px;
    max-width: 100vw;
    @apply text-center flex-grow;
  }

  &__text {
    text-align: center;
  }

  &__footer {
    flex-shrink: 0;
    display: flex;

    @apply border-t border-gray-200;

    &.is-column {
      flex-direction: column;

      .base-confirm__action {
        border-left: none;

        &:not(:first-child) {
          @apply border-t border-gray-200;
        }
      }
    }
  }

  &__action {
    @apply flex-grow h-12 truncate bg-transparent rounded-none duration-200;
    flex-basis: 0%;
    color: inherit;

    &:hover:not([disabled]) {
      background: #fafafa;
    }

    &:focus {
      outline: none;
    }

    &:not(:first-child) {
      @apply border-t border-gray-200;
    }
  }
}
</style>
