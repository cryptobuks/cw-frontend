<template>
  <div class="grid grid-cols-2 gap-x-4">
    <button
      v-for="tab in tabs"
      :key="tab[property]"
      class="p-1 focus:outline-none text-sm capitalize"
      :class="
        active[property] === tab[property]
          ? 'border-b-4 text-darkred border-darkred'
          : ''
      "
      @click="active = tab"
    >
      {{ tab[name] }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'BaseTabs',
  props: {
    tabs: { type: Array, required: true },
    property: { type: String, required: true },
    returnObject: Boolean,
    value: { type: null, default: 'name' },
    name: { type: String, default: 'title' }
  },
  data: () => ({ active: {} }),
  watch: {
    active: {
      deep: true,
      handler (tab) {
        const value = this.returnObject ? tab : tab[this.property]
        this.$emit('input', value)
      }
    }
  },
  created () {
    this.active[this.property] = this.value
  }
}
</script>

<style>
</style>
