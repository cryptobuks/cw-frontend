<template>
  <div>
    <label class="cursor-pointer" :for="_uid">
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
    </label>
    <input
      :id="_uid"
      v-model="output"
      type="checkbox"
      class="hidden"
      :disabled="disabled"
      :value="value"
    >
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
    result: { type: [Boolean, Array], default: () => [] },
    size: { type: Number, default: 20 }, // in pixels
    trueClass: { type: String, default: 'text-green' },
    value: { type: null, default: null }
  },
  data: () => ({ checked: false, output: false }),
  watch: {
    result: {
      immediate: true,
      deep: true,
      handler (result) {
        if (typeof result === 'boolean') {
          this.checked = this.result
          this.output = this.result
        } else {
          this.checked =
            this.result.find(value =>
              this.inputKey
                ? value[this.inputKey] === this.value[this.inputKey]
                : value === this.value
            ) || false
          this.output = this.result
        }
      }
    },
    output: {
      deep: true,
      handler (output) {
        this.$emit(
          'change',
          this.outputKey ? this.output[this.outputKey] : output
        )
      }
    }
  }
}
</script>

<style></style>
