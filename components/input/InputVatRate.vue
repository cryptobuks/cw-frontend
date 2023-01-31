<template>
  <base-select
    v-bind="$attrs"
    :items="vatRatesByCountry[countryCode] || []"
    item-text="text"
    item-value="_id"
    v-on="$listeners"
  />
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    countryCode: { type: String, default: null }
  },
  data () {
    return {
      vatRatesByCountry: {}
    }
  },
  computed: mapState('country', ['vatRates', 'managedCountries']),
  watch: {
    // Reset on country changed
    countryCode () {
      this.$emit('input', null)
      this.fetchVatRates()
    }
  },
  async created () {
    await this.getManagedCountries()
    await this.fetchVatRates()
  },
  methods: {
    ...mapActions('country', ['getVatRateList', 'getManagedCountries']),

    async fetchVatRates () {
      const countryCode = this.countryCode
      if (countryCode && !this.vatRatesByCountry[countryCode]) {
        const country = this.managedCountries.find(c => c.code === countryCode)
        if (country) {
          await this.getVatRateList({ countryId: country._id })
          this.vatRatesByCountry = {
            ...this.vatRatesByCountry,
            [countryCode]: [...this.vatRates]
          }
        }
      }
    }
  }
}
</script>
