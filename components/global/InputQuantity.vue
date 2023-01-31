<template>
  <div
    class="h-6 inline-flex items-center relative text-sm text-white"
    :style="{ width: `calc(5rem + ${Math.max(0, (value + '').length - 2) * 0.5 + 'em'})` }"
  >
    <span
      class="inline-flex w-6 h-6 items-center justify-center absolute select-none top-0 left-0 cursor-pointer"
      @click="setValue(value - 1)"
    > - </span>

    <input
      ref="input"
      v-bind="$attrs"
      :value="value"
      type="number"
      :min="min"
      :max="max"
      :class="[inputClass]"
      class="w-full h-full px-5 outline-none border border-gray-700 text-white rounded bg-transparent text-center"
      v-on="$utils.except($listeners, ['input', 'blur'])"
      @blur="onBlur"
      @input="setValue(+$event.target.value || 0)"
    >

    <span
      class="inline-flex w-6 h-6 items-center justify-center absolute select-none top-0 right-0 cursor-pointer"
      @click="setValue(value + 1)"
    > + </span>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Number, default: 0 },
    min: { type: [Number, String], default: 0 },
    max: { type: [Number, String], default: 9999999 },
    inputClass: { type: String, default: '' }
  },
  methods: {
    onBlur (e) {
      setTimeout(() => {
        if (document.activeElement !== this.$refs.input) {
          this.$emit('blur', e)
        }
      }, 200)
    },
    focus () {
      this.$refs.input?.focus?.()
    },
    setValue (val) {
      if (val >= this.min && val <= this.max) {
        this.$emit('input', val)
        this.focus()
      }
    }
  }
}
</script>
