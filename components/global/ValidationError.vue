<template>
  <base-transition v-if="!hideError" :active="!!errorMsg" name="fade">
    <div class="base-error">
      <slot :name="`error${failedRuleName ? ':' + failedRuleName : ''}`" :message="errorMsg">
        {{ errorMsg }}
      </slot>
    </div>
  </base-transition>
</template>

<script>
export default {
  props: {
    // eslint-disable-next-line vue/require-prop-types
    value: { default: null },

    // eslint-disable-next-line vue/require-prop-types
    validatedValue: { default: undefined },

    // Rule functions. Either return false or error message
    // Accept either an array of functions or a object of key value pair
    // in which the key will be used as the slot name for the error
    rules: { type: [Array, Object], default: () => [] },

    // Use by other global components as an alternative to rules prop
    // To inject validation rules without affecting the rules prop
    hiddenRules: { type: [Array, Object], default: () => [] },

    hideError: Boolean
  },
  data () {
    return {
      errorMsg: null,
      failedRuleName: null
    }
  },
  computed: {
    // Merge hiddenRules with rules
    mergedRules () {
      const isArray = Array.isArray(this.hiddenRules) && Array.isArray(this.rules)
      return isArray ? this.hiddenRules.concat(this.rules) : Object.assign({}, this.hiddenRules, this.rules)
    }
  },
  methods: {
    setError (msg = null, ruleName = null) {
      this.errorMsg = msg || null
      this.failedRuleName = ruleName || null

      this.$emit('error', this.errorMsg)
      ruleName && this.$emit('error:' + ruleName, this.errorMsg)
    },

    async validate (inputRules) {
      const parsedInputRules = typeof inputRules === 'string'
        ? this.mergedRules[inputRules]
          ? { [inputRules]: this.mergedRules[inputRules] }
          : null
        : inputRules

      if (!parsedInputRules) {
        this.errorMsg = this.failedRuleName = null
      }

      const rawRules = parsedInputRules || this.mergedRules
      const rules = Array.isArray(rawRules)
        ? rawRules.map(r => [r?.name, r])
        : Object.entries(rawRules)

      if (rules.length && this.isModified()) {
        for (const [ruleName, ruleFunc] of rules) {
          if (typeof ruleFunc !== 'function') {
            continue
          }

          const result = await ruleFunc(this.value)
          if (typeof result === 'string' || result === false) {
            this.setError(result || 'Error', ruleName)

            return false
          }
        }
      }

      if (this.failedRuleName && (!parsedInputRules || Object.keys(parsedInputRules).includes(this.failedRuleName))) {
        this.resetValidation()
      }

      const valid = !this.failedRuleName
      valid && this.$emit('validated')
      return valid
    },

    isModified () {
      if (this.validatedValue === undefined) {
        return true
      }

      if (Array.isArray(this.validatedValue) && !Array.isArray(this.value)) {
        return this.validatedValue.every(val => this.$utils.isModified(val, this.value))
      }

      return this.$utils.isModified(this.validatedValue, this.value)
    },

    resetValidation (ruleName) {
      if (ruleName && ruleName !== this.failedRuleName) {
        return
      }

      this.errorMsg = this.failedRuleName = null
      this.$emit('reset')
    }
  }
}
</script>

<style lang="scss">
.base-error {
  font-size: 15px;
  margin-bottom: -1em;
  color: #FF0000;
  @apply text-center leading-none;
}
</style>
