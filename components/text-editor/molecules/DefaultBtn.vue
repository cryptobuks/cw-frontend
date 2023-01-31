<template>
  <button
    v-tippy="{
      content: $t(tooltip),
      trigger: 'mouseenter'
    }"
    type="button"
    :class="[
      isActive
        ? 'cw-text-editor__btn--active'
        : disabled
          ? 'cw-text-editor__btn--disabled'
          : ''
    ]"
    class="cw-text-editor__btn"
    @mousedown.prevent
    @click="onClick"
  >
    <base-icon :name="icon" />

    <base-icon v-if="menu" name="chevron-down" size="8" class="ml-1" />

    <slot />
  </button>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    icon: { type: String, default: null },
    tooltip: { type: [String, Function], default: null },
    isActive: Boolean,
    command: { type: Function, default: null },
    disabled: Boolean,
    menu: Boolean
  },
  methods: {
    onClick (e) {
      if (this.disabled) {
        return
      }

      if (this.$listeners.click) {
        return this.$emit('click', e)
      }

      if (this.command) {
        this.command(e)
      }
    }
  }
}
</script>

<style lang="scss">
.cw-text-editor__btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: .3s;
  overflow: hidden;
  background: transparent;
  border: none;

  @apply text-white text-opacity-80;

  &:hover, &:focus {
    outline: none;
    @apply text-white;
  }

  &--active {
    @apply bg-gray-800;

    &:hover {
      @apply bg-gray-800
    }
  }

  &--disabled {
    cursor: default;
    @apply text-gray-400;

    &:hover {
      @apply text-gray-400;
    }
  }
}
</style>
