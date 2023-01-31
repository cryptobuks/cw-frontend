<template>
  <button
    :type="type"
    v-bind="$attrs"
    class="base-button"
    :disabled="disabled || loading"
    :class="{
      'is-primary': primary,
      'is-light': light,
      'is-loading': loading,
      'is-inline': inline,
      'is-lg': lg,
      'is-xl': xl,
    }"
    v-on="listeners"
    @click="onClick"
  >
    <slot />

    <div v-if="loading" class="base-button__loading">
      <base-spinner size="sm" />
    </div>
  </button>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    primary: Boolean,
    secondary: Boolean,
    light: Boolean,
    loading: Boolean,
    inline: Boolean,
    disabled: Boolean,
    xl: Boolean,
    lg: Boolean,
    to: { type: String, default: null },
    type: { type: String, default: 'button' }
  },
  computed: {
    listeners () {
      const { ...listeners } = this.$listeners
      delete listeners.click
      return listeners
    }
  },
  methods: {
    onClick (e) {
      if (this.disabled) {
        return
      }

      if (this.to) {
        this.$router.push(this.to)
      }

      this.$emit('click', e)
    }
  }
}
</script>

<style lang="scss">
.base-button {
  @apply appearance-none border-none outline-none h-10 py-1 px-4 rounded bg-white text-gray-700 flex justify-center items-center text-base;

  &:not(.is-inline) {
    @apply w-full;
  }

  &.is-inline {
    @apply inline-flex;
  }

  &.is-lg {
    @apply h-12 px-5;
  }

  &.is-xl {
    @apply h-15 text-2xl py-2 px-6;
  }

  &.is-primary {
    @apply bg-blue text-white;
  }

  &:focus,
  &:active {
    @apply shadow-none outline-none;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:disabled,
  &.disabled {
    @apply bg-gray-500 text-gray-400 opacity-95;
  }

  &.is-loading {
    @apply relative;
  }

  &__loading {
    background-color: inherit;
    @apply absolute inset-0 z-10 flex justify-center items-center rounded;
  }
}
</style>
