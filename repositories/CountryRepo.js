export default ({ $axios }) => {
  const cached = {
    countries: null,
    managedCountries: null,
    myCountryCode: null
  }

  return {
    getCountrySettings (params = {}) {
      return $axios.$get('/api/settings/countries', { params })
    },

    async getCountries () {
      if (!cached.countries) {
        cached.countries = $axios.get('/countries.json').then((res) => {
          cached.countries = res.data
        })
      }

      if (cached.countries instanceof Promise) {
        await cached.countries
      }

      return cached.countries
    },

    async getMyCountryCode () {
      if (!cached.myCountryCode) {
        cached.myCountryCode = $axios.$get('https://www.iplocate.io/api/lookup/', { withCredentials: false })
          .then((res) => {
            cached.myCountryCode = res.country_code.toLowerCase()
          })
          .catch(() => 'it')
      }

      if (cached.myCountryCode instanceof Promise) {
        await cached.myCountryCode
      }

      return cached.myCountryCode
    },

    async getManagedCountries () {
      if (!cached.managedCountries) {
        cached.managedCountries = $axios.get('/api/auth/company/managed/countries').then((res) => {
          cached.managedCountries = res.data.data
        })
      }

      if (cached.managedCountries instanceof Promise) {
        await cached.managedCountries
      }

      return cached.managedCountries
    }
  }
}
