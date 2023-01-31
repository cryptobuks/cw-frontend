<template>
  <component
    :is="to ? 'nuxt-link' : 'div'"
    :to="to"
    class="cw-navbar__item"
    :class="{
      'cw-navbar__item--active': active,
      'cw-navbar__item--small': small
    }"
  >
    <slot name="icon">
      <div v-if="icon" class="cw-navbar__item__icon">
        <base-icon
          v-tippy="small || shouldShowLabel ? false : $t(label)"
          :name="icon + (active ? '-filled' : '')"
          :size="small ? 20 : 42"
        />

        <div v-if="badge" class="cw-navbar__item__badge">
          {{ badge }}
        </div>
      </div>
    </slot>

    <div
      v-if="shouldShowLabel || $slots.label"
      class="cw-navbar__item__title"
    >
      <slot name="label">
        {{ $t(label) }}
      </slot>
    </div>

    <slot />
  </component>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    to: { type: String, default: null },
    icon: { type: String, default: null },
    label: { type: String, default: null },
    active: Boolean,
    small: Boolean
  },
  computed: {
    shouldShowLabel () {
      return this.$mq === 'fullhd'
    },
    badge () {
      if (this.label === 'nav.messages') {
        return this.$store.getters['chat/getCountMessagesNotReaded'](this.$auth) || null
      }
      return null
    }
  }
}
</script>

<style lang="scss">
.cw-navbar__item {
  display: flex;
  flex-grow: 1;
  flex-basis: 0%;
  justify-content: center;
  align-items: center;
  color: #434343;
  cursor: pointer;

  &.nuxt-link-active, &--active {
    @apply text-black;
  }

  &--small {
    color: #fff;

    &.cw-navbar__item--active {
      color: #fff;
    }

    &:hover {
      color: #fff;
    }
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
  }

  &__icon {
    position: relative;
  }

  &__badge {
    font-size: 11px;
    top: -6px;
    right: -7px;
    min-width: 16px;
    @apply absolute h-4 bg-cw-red text-white text-center py-0 px-1 rounded-lg;
  }

  &__title {
    margin-left: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
