<template>
  <form ref="form" v-bind="$attrs" v-on="patchedListeners">
    <slot :rules="inputRules" />
  </form>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    // Auto validate the children input components before submit
    validateOnSubmit: { type: Boolean, default: true }
  },
  data () {
    return {
      // Predefined rules
      inputRules: {
        required: (v) => {
          let valid = true
          if (Array.isArray(v)) {
            valid = !!v.length
          } else if (typeof v === 'number') {
            valid = v === 0 || !!v
          } else {
            valid = !!v
          }
          return valid || this.$t('validation.required')
        },
        maxLength: length => v =>
          (v && v.length <= length) || !v || `Maximum ${length} characters`,
        minLength: length => v =>
          (v && v.length >= length) || !v || `Minimum ${length} characters`,
        maxSize: (allowed, size) => v =>
          size <= allowed * 1024 * 1024 ||
          `Size should be less than ${allowed} MB`,
        max: number => v =>
          v <= number || `Less than or equal to ${number}`,
        min: number => v =>
          v >= number || `More than or equal to ${number}`,
        maxTime: time => v => !time ||
          this.$utils.setTime(new Date(), v || '00:00') <
            this.$utils.setTime(new Date(), time || '00:00') ||
          `Must be earlier than ${time}`,
        minTime: time => v => !time ||
          this.$utils.setTime(new Date(), v || '00:00') >
            this.$utils.setTime(new Date(), time || '00:00') ||
          `Must be later than ${time}`,
        email: v =>
          !v ||
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(v) ||
          'Invalid email address',
        url: v =>
          /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(
            v
          ) ||
          !v ||
          'Invalid URL',
        alphabet: v =>
          !v ||
          /^[a-z ẮẰẲẴẶĂẤẦẨẪẬÂÁÀÃẢẠĐẾỀỂỄỆÊÉÈẺẼẸÍÌỈĨỊỐỒỔỖỘÔỚỜỞỠỢƠÓÒÕỎỌỨỪỬỮỰƯÚÙỦŨỤÝỲỶỸỴ]+$/gi.test(
            v.trim()
          ) ||
          'Allow alphabetical characters only',
        normal: v =>
          !v ||
          /^[a-z0-9 ._ẮẰẲẴẶĂẤẦẨẪẬÂÁÀÃẢẠĐẾỀỂỄỆÊÉÈẺẼẸÍÌỈĨỊỐỒỔỖỘÔỚỜỞỠỢƠÓÒÕỎỌỨỪỬỮỰƯÚÙỦŨỤÝỲỶỸỴ]+$/gi.test(
            v.trim()
          ) ||
          'Special characters are not allowed',
        phone: v =>
          !v ||
          (v.length >= 10 &&
            /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/gi.test(v)) ||
          'Invalid phone number',
        equal: (target, msg) => v =>
          !v || target === v || msg || `Must be ${target}`,
        nospace: (v) => {
          return !v || !/ /.test(v.trim()) || 'Spaces are not allowed'
        },
        unique: list => (v) => {
          return (
            !v ||
            !list.includes(v.toLowerCase()) ||
            `${v} already present, it must be unique.`
          )
        }
      }
    }
  },
  computed: {
    patchedListeners () {
      const { submit, ...listeners } = this.$listeners
      return Object.assign(
        {
          submit: e => this.submit(e)
        },
        listeners
      )
    }
  },
  mounted () {
    if (!this.$refs.form.querySelector('[type="submit"]')) {
      this.$refs.form.addEventListener('keyup', (e) => {
        if (e.keycode === 13) {
          this.submit(e)
        }
      })
    }
  },
  methods: {
    async submit (evt) {
      evt && evt.preventDefault()

      if (!this.validateOnSubmit || (await this.validateInputs())) {
        this.$emit('submit', evt)
      }
    },

    /**
     * Loops through and validate all validatable children components
     * @return {boolean}
     */
    async validateInputs (children = this.$children, lastState = {}) {
      const state = {
        passed: true,
        scrolled: false
      }

      await this._eachDescendantComponent(
        this.$children,
        async (descendant) => {
          if (typeof descendant.validate === 'function') {
            if (!(await descendant.validate())) {
              if (!state.scrolled && descendant.$el) {
                state.scrolled = true
                descendant.$el.scrollIntoView()
              }

              state.passed = false
            }

            // Stop the descendant loop from going deeper
            return true
          }
        }
      )

      return state.passed
    },

    // Hide all error messages
    resetValidation (ruleName) {
      this._eachDescendantComponent(this.$children, (descendant) => {
        if (typeof descendant.resetValidation === 'function') {
          descendant.resetValidation(ruleName)

          return true
        }
      })
    },

    async _eachDescendantComponent (children, cb) {
      for (const child of children || this.$children) {
        if (
          child.$el &&
          child.$el.tagName &&
          child.$el.tagName.toLowerCase() === 'form'
        ) {
          continue
        }

        const shouldContinue = await cb(child)
        if (shouldContinue === true) {
          continue
        }

        await this._eachDescendantComponent(child.$children || [], cb)
      }
    }
  }
}
</script>
