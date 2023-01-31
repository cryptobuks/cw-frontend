<template>
  <base-input-date
    ref="input"
    :label="$attrs.label || $t('input.dob.label')"
    v-bind="$attrs"
    initial-view="year"
    :initial-year-ago="25"
    :min="minDate"
    :rules="{ ...rules, ...$attrs.rules }"
    v-on="$listeners"
  />
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    role: { type: String, default: null },
    checkEmancipation: Boolean,
    maxAge: { type: Number, default: 120 },
    countryCode: { type: String, default: null }
  },
  data () {
    return {
      ageTargetsByCountry: {},
      fetchCountriesDone: false,
      minAge: null
    }
  },
  computed: {
    ...mapState('country', ['areas', 'countrySettings']),
    minDate () {
      return this.$dayjs().startOf('year').subtract(this.maxAge, 'year').toDate()
    },
    rules () {
      const output = {
        min: d => !d || this.$dayjs(d).isAfter(this.$dayjs(this.minDate)) || this.$t('input.dob.validation.min'),
        max: d => !d || this.$dayjs(d).isBefore(this.$dayjs()) || this.$t('input.dob.validation.max')
      }

      if (this.minAge && (this.role || this.checkEmancipation)) {
        output.minAge = d => !d ||
          this.$utils.getAge(d) >= this.minAge ||
          this.$t(`input.dob.validation.${this.role ? this.$t('roles.' + this.role).toLowerCase() : 'gymer'}_min_age`, { age: this.minAge })
      }

      return output
    }
  },
  watch: {
    countryCode: {
      immediate: true,
      async handler () {
        await this.fetchAgeTargets()
        if (this.$attrs.value) {
          this.$refs.input && this.$refs.input.validate()
        }
      }
    },
    '$attrs.value': {
      immediate: true,
      handler: 'resetRequireTutorState'
    },
    role: 'resetRequireTutorState',
    minAge: 'resetRequireTutorState'
  },
  methods: {
    ...mapActions('country', ['getAgeTargetList', 'getCountrySettings']),

    focus () {
      this.$refs.input?.focus?.()
    },

    async fetchAgeTargets () {
      const countryCode = this.countryCode || await this.$repos.countryRepo.getMyCountryCode()

      if (!this.$auth.isAuthenticated) {
        this.minAge = await this.$repos.authRepo.getEmancipationAge(countryCode)
        return
      }

      if (countryCode && !this.ageTargetsByCountry[countryCode]) {
        await this.fetchCountries()

        const country = this.countrySettings.find(c => c.code === countryCode)
        if (country) {
          await this.getAgeTargetList({ countryId: country._id })
          this.ageTargetsByCountry = {
            ...this.ageTargetsByCountry,
            [countryCode]: [...this.areas]
          }
        }
      }

      this.resetMinAgeByRole()
    },

    resetMinAgeByRole () {
      const areaKey = this.role === 'TT' ? 'tutor' : this.role ? 'working' : 'emancipation'
      const areas = this.ageTargetsByCountry[this.countryCode] || []
      const { items: [area] = [] } = areas.find(a => a.area === areaKey) || {}

      this.minAge = area?.age || 0
    },

    resetRequireTutorState () {
      if (this.$listeners['require-tutor-change']) {
        const shouldRequireTutor = !this.role && this.$dayjs(this.$attrs.value).isBefore(this.$dayjs(this.minAge))
        this.$emit('require-tutor-change', shouldRequireTutor)
      }
    },

    async fetchCountries () {
      if (this.fetchCountriesDone) {
        return
      }
      await this.getCountrySettings()
      this.fetchCountriesDone = true
    }
  }
}
</script>
