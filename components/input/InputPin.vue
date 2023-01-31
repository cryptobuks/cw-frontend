<template>
  <base-input-text
    ref="input"
    v-model="pinNumber"
    v-bind="$attrs"
    input-class="uppercase"
    :label="$t(`profile.${type}s.label`)"
    :validation-value="value"
    :rules="{
      syntax: checkSyntax,
      consistency: checkConsistency,
      ...$attrs.rules,
    }"
    v-on="$utils.except($listeners, 'input')"
  >
    <template #prepend>
      <cw-input-country
        v-model="pinCountryCode"
        :excepts="usedCountryCodes"
        :tabinex="$attrs.tabindex"
        auto-shrink
        @item-select="$refs.input.focus()"
      />
    </template>
  </base-input-text>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import CodiceFiscale from 'codice-fiscale-js'
import { PROVINCE } from 'codice-fiscale-js/src/lista-province'
// import SSN from 'french-ssn'
export default {
  inheritAttrs: false,
  props: {
    value: { type: Object, default: () => ({}) },

    // pin | tin
    type: { type: String, default: 'pin' },

    defaultCountryCode: { type: String, default: '' },

    // Use the same fields prop as for ProgressiveFieldContainer
    relatedFields: { type: Array, default: () => [] },

    // Corresponding values of the fields in relatedFields prop
    relatedData: { type: Object, default: () => ({}) },

    // A profile can have multiple pin but only 1 per country
    usedCountryCodes: { type: Array, default: () => [] }
  },
  data () {
    return {
      // result of parseCodeData to avoid doing computation multiple times
      cached: {
        value: null,
        parsedData: null
      }
    }
  },
  computed: {
    ...mapState('country', ['myCountryCode']),
    pinNumber: {
      get () {
        const { value = '' } = this.value || {}
        return value
      },
      set (value) {
        this.$emit('input', {
          ...this.value,
          value: value ? value.toUpperCase() : value
        })
      }
    },

    pinCountryCode: {
      get () {
        const { countryCode = null } = this.value || {}
        return countryCode
      },
      set (countryCode) {
        this.$emit('input', {
          ...this.value,
          countryCode
        })
      }
    },

    // Use this object to compare with the parsedData instead of raw relatedData prop
    transformedRelatedData () {
      return this.transformRelatedData(this.relatedData)
    },

    isPinReadble () {
      return this.pinCountryCode === 'it'
    },

    isEmpty () {
      return !this.pinCountryCode || !this.pinNumber
    }
  },
  watch: {
    value () {
      this.fixValue()
    }

    // TODO Uncomment once the input birth place's data schema is fixed
    // // Whenever a related field's value changes, need to recalculate a new pinNumber corresponding to the new value
    // // And ask to replace the current pinNumber with the new one
    // transformedRelatedData (data, oldData) {
    //   if (!data || !oldData || this.isEmpty || this.relatedFields.every(f => !data[f.name] || data[f.name] === oldData[f.name])) {
    //     return
    //   }

    //   const newPinValue = this.getPinValueFromRelatedData()
    //   if (typeof newPinValue === 'string' && (!this.pinNumber || newPinValue !== this.pinNumber.toUpperCase())) {
    //     this.$confirm({
    //       text: this.$t('input.pin.confirm_new_pin', { pin: newPinValue }),
    //       dismissible: false,
    //       overlay: true
    //     }, () => this.forceChangePinValue(newPinValue))
    //   }
    // }
  },
  created () {
    this.fixValue(true)
  },
  methods: {
    ...mapActions('country', ['getMyCountryCode']),

    async fixValue (checkCountryCode = false) {
      if (!this.value || (checkCountryCode && !this.value.countryCode)) {
        const countryCode = this.defaultCountryCode || this.myCountryCode || (await this.getMyCountryCode())
        this.$emit('input', {
          key: this.type,
          value: null,
          ...this.value,
          countryCode: this.usedCountryCodes.includes(countryCode) ? null : countryCode
        })
      }
    },

    forceChangePinValue (pinNumber) {
      this.pinNumber = pinNumber

      // This event helps with syncing with tin
      this.$nextTick(() => this.$listeners['force-changed'](this.value))
    },

    checkSyntax (pin) {
      return !this.isPinReadble ||
        !pin?.value ||
        !!this.parseCodeData() ||
        this.$t('input.pin.validation.syntax')
    },

    checkConsistency (pin) {
      if (!this.relatedFields.length) {
        return true
      }

      const parsedData = this.parseCodeData()
      if (parsedData) {
        // TODO Replace this with the commented lines once the input birth place's data schema is fixed
        this.syncRelatedData()

        // const diffFields = this.relatedFields.filter((f) => {
        //   const parsedValue = parsedData[f.name]
        //   const relatedValue = this.transformedRelatedData[f.name]
        //   return parsedValue && relatedValue && parsedValue.toLowerCase() !== relatedValue.toLowerCase()
        // })

        // if (diffFields.length) {
        //   setTimeout(() => {
        //     this.$confirm({
        //       html: `<p class="text-left">
        //         ${this.$t('input.pin.confirm_inconsistency')}
        //         <br><br>
        //         A. ${this.$attrs.label || this.$t('input.pin.label')}
        //         <br><br>
        //         B. ${diffFields.map(f => f.label || f.name).join(', ')}
        //       </p>`,
        //       noText: 'A',
        //       yesText: 'B',
        //       dismissible: false,
        //       overlay: true
        //     })
        //       .then(() => this.forceChangePinValue(null))
        //       .catch(() => this.syncRelatedData(diffFields))
        //   }, 250)
        // } else {
        //   this.syncRelatedData()
        // }
      }

      return true
    },

    // Fill in related fields that are empty by data extracted from pinNumber
    syncRelatedData (fields = []) {
      if (!this.$listeners['set-related-data']) {
        return
      }

      const parsedData = this.parseCodeData()
      const changes = {}
      this.relatedFields.forEach((f) => {
        if (fields.includes(f) || (parsedData[f.name] && !this.transformedRelatedData[f.name])) {
          changes[f.name] = parsedData[f.name]
        }
      })

      this.$listeners['set-related-data'](this.detransformRelatedData(changes))
    },

    parseCodeData () {
      if (this.isEmpty) {
        this.cached.value = this.cached.parsedData = null
      } else if (this.pinCountryCode + this.pinNumber !== this.cached.value) {
        this.cached.value = this.pinCountryCode + this.pinNumber
        this.cached.parsedData = null

        if (this.isPinReadble) {
          try {
            const info = new CodiceFiscale(this.pinNumber)
            this.cached.parsedData = {
              firstname: info.name,
              lastname: info.surname,
              gender: info.gender === 'M' ? 'male' : 'female',
              dob: this.$dayjs(info.birthday).format('YYYY-MM-DD'),
              pob: info.birthplace?.prov || null
            }
          } catch (_) {}
        }
      }

      return this.cached.parsedData
    },

    // Generate a pin corresponding the the related data
    getPinValueFromRelatedData () {
      const parsedData = this.parseCodeData()
      if (!parsedData) {
        return
      }

      const data = { ...this.transformedRelatedData }

      for (const key of Object.keys(parsedData)) {
        data[key] = data[key] || parsedData[key]
      }

      if (!Object.keys(data).some(k => data[k] && data[k].toLowerCase() !== parsedData[k].toLowerCase())) {
        return
      }

      if (this.isPinReadble) {
        if (!data.firstname || !data.lastname || !data.gender || !data.dob || !data.pob) {
          return
        }

        try {
          const d = this.$dayjs(data.dob)
          const newPin = new CodiceFiscale({
            name: data.firstname,
            surname: data.lastname,
            gender: data.gender === 'male' ? 'M' : 'F',
            day: d.date(),
            month: d.month() + 1,
            year: d.year(),
            birthplace: PROVINCE[data.pob]
          })

          return newPin.code
        } catch (_) {
          return ''
        }
      }
    },

    transformRelatedData (relatedData) {
      return Object.assign({}, relatedData, this.$utils.extract(relatedData, [
        { from: 'dob', transform: dob => (dob && this.$dayjs(dob).format('YYYY-MM-DD')) || null }
      ]))
    },

    detransformRelatedData (transformed) {
      return Object.assign({}, transformed, this.$utils.extract(transformed, [
        { from: 'dob', transform: dob => (dob && this.$dayjs(dob, 'YYYY-MM-DD').toDate()) || null },
        { from: 'pob', transform: pob => (PROVINCE[pob] && PROVINCE[pob] + ', Italy') || null }
      ]))
    }
  }
}
</script>
