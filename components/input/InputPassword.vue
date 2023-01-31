<template>
  <base-input-text
    ref="input"
    v-bind="$attrs"
    :value="value"
    :label="$attrs.label || $t('input.pw.label')"
    :type="isPasswordText ? 'text' : 'password'"
    :rules="strict ? validationRules : [validationRules[0]]"
    :append-icon="value ? isPasswordText ? 'eye-slash' : 'eye' : null"
    :listeners="$attrs.listeners"
    :icon-size="30"
    v-on="$listeners"
    @append-icon="isPasswordText = !isPasswordText"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: String, default: null },
    rules: { type: Array, default: () => [] },
    strict: Boolean
  },
  data () {
    return {
      isPasswordText: false,
      validationRules: [
        v => !!v || this.$t('input.pw.validation.required'),
        v => v.length >= 8 || this.$t('input.pw.validation.length'),
        v => /[a-z]/.test(v) || this.$t('input.pw.validation.lowercase'),
        v => /[A-Z]/.test(v) || this.$t('input.pw.validation.uppercase'),
        v => /[0-9]/.test(v) || this.$t('input.pw.validation.digit'),
        v => /\W/.test(v) || this.$t('input.pw.validation.special'),
        v => /^[\w!@#$%^&*()\-_=+{};:,<.>]+$/.test(v) || this.$t('input.pw.validation.no_special_chars')
      ]
    }
  },
  methods: {
    focus () {
      this.$refs.input?.focus()
    },

    validate (...params) {
      return this.$refs.input?.validate(...params)
    }
  }
}
</script>
