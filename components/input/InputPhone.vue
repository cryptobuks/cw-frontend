<template>
  <base-input-text
    v-if="value"
    ref="input"
    v-model.trim="phoneNumber"
    :label="landline ? $t('input.phone.label_landline') : $t('input.phone.label_mobile')"
    type="tel"
    class="cw-input-phone"
    v-bind="$attrs"
    :validation-value="value"
    :rules="{
      syntax: checkSyntax,
      ...$attrs.rules
    }"
    v-on="$utils.except($listeners, 'input')"
  >
    <template #prepend>
      <cw-input-country
        v-model="countryCode"
        auto-shrink
        :tabindex="countryCode ? -1 : $attrs.tabindex"
        @focus="onCountryCodeFocus"
        @blur="onCountryCodeBlur"
      />
    </template>

    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-text>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    value: { type: [Object, String], default: null },
    defaultCountryCode: { type: String, default: '' },
    landline: Boolean
  },
  computed: {
    ...mapGetters('country', ['localizedCountries']),

    countryCode: {
      get () {
        return this.value && this.value.countryCode
      },
      set (countryCode) {
        const { prefix = null } = countryCode
          ? this.localizedCountries.find(c => c.code === countryCode)
          : {}

        Object.assign(this.value, {
          countryCode,
          prefixNumber: prefix
        })

        if (countryCode) {
          setTimeout(() => this.$refs.input?.focus(), 200)
        }
      }
    },

    phoneNumber: {
      get () {
        return this.value && this.value.phoneNumber
      },
      set (phoneNumber) {
        Object.assign(this.value, {
          phoneNumber
        })
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: 'reset'
    },
    defaultCountryCode: 'reset'
  },
  methods: {
    ...mapActions('country', ['getCountries', 'getMyCountryCode']),

    reset () {
      const phone = this.value
      if (!phone) {
        this.$emit('input', {
          countryCode: null,
          prefixNumber: null,
          phoneNumber: null
        })
      } else if (typeof phone === 'string') {
        this.parsePhoneString(phone)
      } else if (phone && !phone.countryCode) {
        this.setDefaultCountryCode()
      } else if (phone && phone.countryCode && !phone.prefixNumber) {
        this.setDefaultPrefixNumber(phone)
      }
    },

    onCountryCodeFocus () {
      this.$attrs.listeners?.focus?.()
    },

    onCountryCodeBlur () {
      if (!this.value.countryCode && (!document.activeElement || !this.$el.contains(document.activeElement))) {
        this.$refs.input.validate()
      }
    },

    checkSyntax (phone) {
      const { phoneNumber, countryCode } = phone || {}
      if (this.landline || !phoneNumber || !countryCode) {
        return true
      }

      const country = this.localizedCountries.find(c => c.code === countryCode)
      const syntaxRegex = country && country.mobile ? new RegExp(country.mobile) : /^[0-9 ]{7,}$/
      const trimRegex = country ? new RegExp(`^\\${country.prefix}`) : ''

      return syntaxRegex.test(phoneNumber.trim().replace(trimRegex, '')) || this.$t('input.phone.validation.syntax')
    },

    async setDefaultCountryCode () {
      await this.getCountries()
      const countryCode = this.defaultCountryCode || await this.getMyCountryCode()
      const country = (countryCode && this.localizedCountries.find(c => c.code === countryCode)) ||
        this.localizedCountries.find(c => c.code === 'it')
      country && Object.assign(this.value, { countryCode: country.code, prefixNumber: country.prefix })
    },

    async setDefaultPrefixNumber (phone) {
      await this.getCountries()
      const countryCode = phone.countryCode.toLowerCase()
      const country = this.localizedCountries.find(c => c.code === countryCode)
      Object.assign(this.value, country ? { countryCode, prefixNumber: country.prefix } : { countryCode: null })
    },

    parsePhoneString (phone) {
      const phoneWithoutPlus = phone.replace(/^\+/, '')
      const fullNumber = '+' + phoneWithoutPlus
      const country = this.findCountryByPrefixNumber(fullNumber.substr(0, 4)) ||
        this.findCountryByPrefixNumber(fullNumber.substr(0, 3))

      this.$emit('input', {
        countryCode: country?.code || null,
        prefixNumber: country?.prefix || null,
        phoneNumber: country
          ? fullNumber.replace(new RegExp('^\\' + country.prefix), '')
          : phoneWithoutPlus
      })
    },

    findCountryByPrefixNumber (prefix) {
      return this.localizedCountries.find(c => c.prefix === prefix)
    }
  }
}
</script>
