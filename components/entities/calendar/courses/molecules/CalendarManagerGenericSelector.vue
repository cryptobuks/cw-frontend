<template>
  <label
    class="relative flex items-center bg-gray-500 h-8 py-1 rounded-md cursor-pointer transition-colors duration-100"
    style="max-width: 100px"
  >
    <input type="radio" :checked="checked_" :value="value" @change="$emit('change', value)">
    <span class="text-xs text-white max-lines-2 leading-none pl-4 pr-2"><slot /></span>
    <div class="absolute flex justify-center items-center top-0 left-0 bg-white w-2 h-2 m-1 rounded-full z-10">
      <base-icon name="check" size="10" class="flex-shrink-0 text-black" :style="{ display: !checked_ ? 'none' : null }" />
    </div>
  </label>
</template>

<script>
export default {
  model: {
    prop: 'modelValue',
    event: 'change'
  },
  props: {
    modelValue: { type: String, default: '' },
    value: { type: String, default: '' },
    checked: { type: Boolean, default: null }
  },
  computed: {
    checked_ () {
      if (this.checked !== null) {
        return this.checked
      }
      return this.value && this.modelValue ? this.value === this.modelValue : false
    }
  }
}
</script>

<style lang="postcss" scoped>
.max-lines-2 {
  @apply truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 2) and (-webkit-box-orient: vertical) {
    text-overflow: initial;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
