<template>
  <div
    :class="[!disabled && 'cursor-pointer']"
    @click="
      () => !disabled && $emit('change', outputKey ? value[outputKey] : value)
    "
  >
    <base-icon
      v-if="checked"
      name="check-circle"
      :class="[trueClass]"
      :size="size"
    />
    <div
      v-else
      class="rounded-full text-center"
      :style="{ height: `${size}px`, width: `${size}px` }"
      :class="[falseClass]"
    />
  </div>
</template>

<script>
export default {
  model: {
    prop: 'result',
    event: 'change'
  },
  props: {
    disabled: Boolean,
    falseClass: { type: String, default: 'border-2 border-gray-600' },
    inputKey: { type: String, default: null },
    outputKey: { type: String, default: null },
    result: { type: null, default: null },
    size: { type: Number, default: 20 }, // in pixels
    trueClass: { type: String, default: 'text-green' },
    value: { type: null, default: null }
  },
  data: () => ({ checked: false }),
  watch: {
    result: {
      immediate: true,
      deep: true,
      handler (result) {
        if (!result) {
          return
        }
        this.checked = this.inputKey
          ? this.value[this.inputKey] === result[this.inputKey]
          : this.value === result
      }
    }
  }
}
</script>

<style></style>
