<template>
  <base-input-text
    v-bind="$attrs"
    input-class="uppercase"
    :rules="{
      syntax: validateIBAN,
      ...$attrs.rules
    }"
    v-on="$listeners"
    @validated="$attrs.value && $emit('input', $attrs.value.replace(/ /g, ''))"
  />
</template>

<script>
import * as IBAN from 'iban'
export default {
  inheritAttrs: false,
  data () {
    return {
      // E.g. BE68539007547034
      validateIBAN: v => IBAN.isValid(v) || 'Invalid IBAN'
    }
  }
}
</script>
