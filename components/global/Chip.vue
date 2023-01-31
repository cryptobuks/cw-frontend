<template>
  <div class="base-chip" :class="{ light, danger }">
    <div v-auto-resize-text="{ min: 11, max: 14 }" class="base-chip__body">
      <slot />
    </div>

    <span v-if="dismissible" class="base-chip__remove" @click.stop="dismiss">
      <base-icon size="6">
        dismiss
      </base-icon>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    dismissible: Boolean,
    light: Boolean,
    danger: Boolean
  },
  methods: {
    dismiss () {
      this.$emit('dismiss')
    }
  }
}
</script>

<style lang="scss">
.base-chip {
  height: 26px;
  min-width: 50px;
  max-width: 200px;
  font-size: 14px;
  @apply inline-flex items-center cursor-default py-0 px-4 rounded-lg bg-white text-black;

  &.light {
    @apply bg-gray-600 text-white;
  }

  &.danger {
    @apply bg-red text-white;
  }

  &__body {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__remove {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 25px;
    cursor: pointer;
    margin-right: -15px;
  }
}
</style>
