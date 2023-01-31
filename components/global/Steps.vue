<template>
  <div class="flex ml-3">
    <div
      v-for="(step, stepsIndex) in visibleSteps"
      :key="`steps-${stepsIndex}`"
      class="flex flex-col items-center space-y-2"
    >
      <span :class="titleClass">{{ step.title }}</span>
      <div class="flex items-center">
        <button
          class="h-14 w-14 rounded-full text-black focus:outline-none"
          :class="[step[property] === value ? 'bg-white' : 'bg-gray-500']"
          @click="$emit('input', step[property])"
        >
          <span class="font-bold">{{ stepsIndex + 1 }}</span>
        </button>
        <div
          :class="[
            connectorClass,
            visibleSteps.length - 1 > stepsIndex ? '' : 'border-none',
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    connectorClass: {
      type: String,
      default: 'border-t-2 border-gray-500 w-40'
    },
    property: { type: String, default: 'id' },
    steps: { type: Array, required: true },
    titleClass: {
      type: String,
      default: 'font-bold -ml-40'
    },
    value: { type: [Array, Object, String, Number], required: true }
  },
  computed: {
    visibleSteps () {
      const filteredSteps = []
      for (const index in this.steps) {
        const step = this.steps[index]
        filteredSteps.push(step)
        if (step[this.property] === this.value) { break }
      }
      return filteredSteps
    }
  }
}
</script>

<style>
</style>
