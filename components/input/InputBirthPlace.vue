<template>
  <cw-input-address
    v-model="address"
    v-bind="$attrs"
    city-only
    v-on="$utils.except($listeners, 'input')"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: String, default: () => null }
  },
  computed: {
    address: {
      get () {
        return {
          fulladdress: this.value
        }
      },

      set (addr) {
        this.$emit('input', addr?.fulladdress || null)
      }
    }
  }
}
</script>
