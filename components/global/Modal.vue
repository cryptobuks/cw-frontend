<template>
  <div
    v-show="!!$scopedSlots.activator"
    class="base-modal__activator"
    @click.stop="show"
  >
    <slot name="activator" :show="() => show()" />

    <div
      ref="container"
      class="base-modal"
      :class="{
        light,
        shown,
        'is-mobile': isMobileView,
      }"
      @mousedown.self="onClickOutside"
      @touchstart.self="onClickOutside"
    >
      <base-transition
        v-if="hasOverlay"
        :active="shown"
        :name="noAnimate ? 'off' : 'base-modal__zoom-inset'"
        :delay="shown || noAnimate ? 0 : activeDelay"
      >
        <div class="base-modal__overlay" @click="onClickOutside" />
      </base-transition>

      <base-transition
        :active="shown"
        :name="
          parentModal || noAnimate ? 'off' : isMobileView ? 'slide-down' : 'zoom-center'
        "
        :delay="shown && hasOverlay && !noAnimate ? activeDelay : 0"
      >
        <div
          ref="content"
          class="base-modal__content"
          :class="[contentClass]"
          :style="{ height: height ? `${height}px` : '' }"
        >
          <header
            class="base-modal__header"
            :class="{
              'has-save': saveInHeader,
              'has-dismiss-left': !!parentModal,
            }"
          >
            <slot name="header" v-bind="{ exit }">
              <div class="base-modal__title">
                <slot name="title">
                  {{ title }}
                </slot>
              </div>

              <div
                v-if="saveInHeader"
                class="base-modal__header__save"
                @click.prevent="onSaveClick"
              >
                <base-icon v-tippy="'Save'" :name="saveIcon" size="18" />
              </div>

              <div
                v-if="dismissible"
                class="base-modal__header__dismiss"
                @click.prevent="exit"
              >
                <base-icon
                  :name="parentModal ? 'chevron-left' : 'dismiss'"
                  size="14"
                />
              </div>
            </slot>
          </header>

          <base-scroll
            ref="body"
            tag="main"
            class="base-modal__body"
            :class="[bodyClass]"
            :style="[
              hasSlot('actions') ? { minHeight: 'calc(100vh - 240px)' } : '',
            ]"
            :options="perfectScrollbarOptions"
          >
            <slot :active="shown" :hide="() => hide()" />
          </base-scroll>

          <footer
            v-if="!saveInHeader && ($slots.actions || $listeners.done)"
            class="flex base-modal__actions"
            :class="[footerClass]"
          >
            <slot name="actions">
              <base-button
                :loading="loading"
                lg
                class="base-modal__actions__submit"
                :class="{ disabled }"
                @click="onSaveClick"
              >
                <base-icon :name="saveIcon" size="25" />
              </base-button>
            </slot>
          </footer>
        </div>
      </base-transition>
    </div>
  </div>
</template>

<script>
import KeyboardEvents from '~/mixins/KeyboardEvents'

export default {
  name: 'Modal',
  mixins: [KeyboardEvents],
  model: {
    prop: 'active',
    event: 'active-change'
  },
  props: {
    active: Boolean,
    disabled: Boolean,
    persistent: Boolean,
    hideOverlay: Boolean,
    noAnimate: Boolean,
    light: Boolean,
    loading: Boolean,
    saveInHeader: Boolean,
    dismissible: { type: Boolean, default: true },
    height: { type: [String, Number], default: null },
    title: { type: String, required: false, default: '' },
    activeDelay: { type: Number, default: 400 },
    contentClass: { type: String, default: '' },
    bodyClass: { type: String, default: '' },
    footerClass: { type: String, default: '' },
    perfectScrollbarOptions: { type: Object, default: () => ({}) },
    saveIcon: { type: String, default: 'save' }
  },
  data () {
    return {
      shown: !!this.active,
      parentModal: null
    }
  },
  computed: {
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    },
    hasOverlay () {
      return !this.isMobileView && !this.hideOverlay && !this.parentModal
    }
  },
  watch: {
    active (active) {
      this.shown = !!active
    }
  },
  mounted () {
    document.body.appendChild(this.$refs.container)

    this.$once(
      'hook:beforeDestroy',
      this.$router.beforeEach((to, from, next) => {
        this.hide()
        next()
      })
    )
  },
  beforeDestroy () {
    document.body.removeChild(this.$refs.container)
    this.resetParentModal()
  },
  methods: {
    show () {
      if (this.shown) {
        return
      }

      this.hideParentModal()

      this.shown = true
      this.$emit('active-change', true)

      this.$nextTick(() => {
        this.$emit('shown')
      })
    },
    hideParentModal () {
      // Modal has background with opacity so to avoid seeing many modals
      // stakcing on each other. This is to hide all other modals if any
      this.parentModal = document.querySelector(
        '.base-modal.shown .base-modal__content:not([invisible])'
      )
      if (this.parentModal) {
        this.parentModal.setAttribute('invisible', '')
      }
    },
    hide (cb) {
      this.shown = false

      this.resetParentModal()

      setTimeout(() => {
        typeof cb === 'function' && cb()
        this.$emit('hidden')
        this.$emit('active-change', false)
      }, this.parentModal ? 0 : this.activeDelay * 2)
    },
    resetParentModal () {
      if (this.parentModal) {
        this.parentModal.removeAttribute('invisible')
        this.parentModal = null
      }
    },
    escPress () {
      if (this.$refs.content && this.dismissible) {
        const $modals = document.querySelectorAll('.base-modal__content')
        if (
          $modals.length &&
          $modals[$modals.length - 1] === this.$refs.content
        ) {
          this.exit()
        }
      }
    },
    async onSaveClick () {
      const progressiveContainer = this.findFormComponent(this.$children)
      if (!progressiveContainer || (await progressiveContainer.validate())) {
        this.$emit('done')
      } else {
        this.$emit('fail')
      }
    },

    exit () {
      if (this.$listeners.dismiss) {
        this.$emit('dismiss')
      } else {
        this.hide()
      }
    },

    onClickOutside () {
      !this.persistent && this.exit()
    },

    hasSlot (value) {
      return !!this.$slots[value]
    },

    findFormComponent ($children) {
      if (!$children) {
        return
      }

      for (const child of $children || []) {
        if (typeof child.validate === 'function') {
          return child
        }

        const progressiveContainer = this.findFormComponent(child.$children)
        if (progressiveContainer) {
          return progressiveContainer
        }
      }
    }
  }
}
</script>

<style lang="scss">
.base-modal {
  @apply text-white pointer-events-none z-100 justify-center items-center flex inset-0 absolute;

  &.shown {
    @apply pointer-events-auto;
  }

  &.is-mobile {
    @apply items-end;

    .base-modal {
      &__content {
        height: 95%;
        max-height: 95%;
        min-width: auto;
        @apply rounded-b-none w-full;
      }

      &__body {
        padding: 12px 25px 6px;
      }

      &__actions {
        padding: 6px 25px 25px;
      }
    }
  }

  &.light {
    @apply text-black;

    .base-modal {
      &__content {
        background-color: rgba(#fff, 0.9);
      }

      &__header {
        background-color: #fff;
      }
    }
  }

  &__activator {
    cursor: pointer;
  }

  .base-modal {
    &__zoom-inset {
      &-enter,
      &-leave-to {
        border-width: 0 !important;
      }
    }

    &__overlay {
      border-left-width: calc(50vw + 100px);
      border-right-width: calc(50vw + 100px);
      border-top-width: calc(50vh + 100px);
      border-bottom-width: calc(50vh + 100px);
      top: -50px;
      right: -50px;
      bottom: -50px;
      left: -50px;
      box-shadow: inset 0 0 20px 35px rgba(#030303, 0.5);
      border-color: rgba(#030303, .5);
      @apply fixed duration-500;
    }

    &__content {
      height: calc(100% - 100px);
      max-height: calc(100% - 100px);
      width: 33vw;
      min-width: 600px;
      z-index: 1;
      @apply flex flex-col relative rounded-10px bg-black bg-opacity-90;

      &[invisible] {
        opacity: 0;
        pointer-events: none;
      }
    }

    &__body {
      flex-grow: 1;
      padding: 25px 50px 12px;
      height: 100% !important;
      width: 100% !important;
    }

    &__header {
      position: relative;
      display: flex;
      align-items: center;
      height: 38px;
      padding: 5px 50px;
      border-bottom: 2px solid rgba(#d8d8d8, 0.1);
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;

      @apply bg-black;

      &.has-save {
        padding-right: 80px;
        padding-left: 80px;
      }

      &.has-dismiss-left {
        .base-modal__header {
          &__save {
            right: 25px;
          }

          &__dismiss {
            left: 25px;
            right: auto;
          }
        }
      }

      &__save,
      &__dismiss {
        position: absolute;
        cursor: pointer;
      }

      &__save {
        right: 50px;
      }

      &__dismiss {
        right: 25px;

        &.is-left {
          right: auto;
          left: 25px;
        }
      }
    }

    &__title {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: -0.24px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 auto;
    }

    &__actions {
      padding: 13px 50px 25px;

      &__submit {
        max-width: 400px;
        margin: 0 auto;
      }
    }
  }
}
</style>
