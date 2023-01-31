<template>
  <div v-if="value" class="base-multi-inputs">
    <div v-for="(item, i) in value" :key="i" class="flex">
      <slot name="item" :item="item" :index="i" />

      <span
        v-if="i === value.length - 1 && i < max && (i > 0 || !isEmptyValue(item, i))"
        class="base-multi-inputs__action ml-1 mb-4"
        @click="onActionClick"
      >
        {{ isEmptyValue(item, i) ? '-' : '+' }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    // Array of items
    value: { type: Array, default: null },

    // Return a new item
    newItem: { type: Function, default: () => '' },

    // Determine if an item is empty
    isEmpty: { type: Function, default: null },

    // Maximum number of items
    max: { type: Number, default: 10 }
  },
  watch: {
    value: {
      immediate: true,
      handler (value) {
        if (!value || !value.length) {
          this.$emit('input', [this.newItem()])
        }
      }
    }
  },
  methods: {
    onActionClick () {
      const i = this.value.length - 1
      if (this.isEmptyValue(this.value[i], i)) {
        this.value.splice(-1, 1)
      } else {
        this.value.push(this.newItem())
      }
    },

    isEmptyValue (val, i) {
      return typeof this.isEmpty === 'function'
        ? this.isEmpty(val, i)
        : this.$utils.isEmpty(val)
    }
  }
}
</script>

<style lang="scss">
.base-multi-inputs {
  &__action {
    line-height: 0.9;
    @apply cursor-pointer ml-1 pointer-events-auto flex-shrink-0 self-end text-xl;
  }
}
</style>
