<template>
  <base-multiple-inputs-wrapper
    :value="value"
    :is-empty="p => !p || !p.value || !p.countryCode"
    :new-item="() => null"
    @input="$listeners.input"
  >
    <template #item="{ index }">
      <cw-input-pin
        :ref="'input:' + index"
        v-model="value[index]"
        v-bind="$attrs"
        :rules="rules"
        :used-country-codes="value.filter((pin, i) => i !== index && pin.countryCode).map(p => p.countryCode)"
        input-class="uppercase"
        v-on="$utils.except($listeners, index !== 0 ? ['input', 'set-related-data', 'forced-change', 'error', 'validated'] : 'input')"
      />
    </template>
  </base-multiple-inputs-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => ([]) },
    rules: { type: [Object, Array], default: () => [] }
  }
}
</script>
