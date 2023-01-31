<template>
  <base-input-text
    v-bind="$attrs"
    :rules="{
      ...$attrs.rules,
      syntax: checkSyntax
    }"
    v-on="$listeners"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  methods: {
    checkSyntax (barcode) {
      return !barcode ||
        (/^\d{8,14}$/.test(parseInt(barcode, 10).toString()) &&
          parseInt(barcode.substring(barcode.length - 1), 10) === this.calculateChecksum(barcode)) ||
        this.$t('input.barcode.validation.syntax')
    },

    calculateChecksum (str) {
      const toInt = num => parseInt(num, 10)
      const gtin = toInt(str).toString()
      const chunks = gtin.split('').map(toInt).reverse()
      let checksum = 0

      // Remove first chuck (checksum)
      chunks.shift()

      // sum numbers and multiply accordingly
      chunks.forEach((number, index) => {
        checksum += index % 2 === 1 ? number : number * 3
      })

      // calc checksum
      checksum %= 10
      checksum = (checksum === 0) ? 0 : (10 - checksum)

      return checksum
    }
  }
}
</script>
