<template>
  <base-input-text
    ref="input"
    v-bind="$attrs"
    :rules="{
      syntax: checkSyntax,
      ...$attrs.rules
    }"
    input-class="uppercase"
    v-on="$listeners"
    @input="skipSyntaxCheck = false"
  >
    <template #error:syntax>
      {{ $t('input.billing_code.validation') }}
    </template>
  </base-input-text>
</template>

<script>
export default {
  inheritAttrs: false,
  data () {
    return {
      skipSyntaxCheck: false
    }
  },
  methods: {
    checkSyntax (v) {
      return this.skipSyntaxCheck || !v || /^[a-zA-Z0-9]{6,7}$/.test(v)
    },
    onCorrectClick () {
      this.$refs.input.resetValidation('syntax')
      this.skipSyntaxCheck = true
    }
  }
}
</script>
