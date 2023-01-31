import { upperFirst } from '@/plugins/utils'

const SET_STATE = 'setState'
const entityTypes = [
  'privacyPolicy',
  'termsAndConditions',
  'roleDocuments',
  'commercialContract',
  'ageTarget',
  'priceList',
  'vatRate'
]

export const state = () => ({
  tmpCountryId: null,
  countries: [],
  myCountryCode: null,
  countrySettings: [],
  areas: [],
  contract: null,
  vatRates: [],
  managedCountries: []
})

export const getters = {
  localizedCountries (state, getters, rootState) {
    const { locale } = rootState.i18n
    return state.countries.map(c => ({ ...c, name: c.name[locale] || c.name.en }))
  },
  managedCountriesCode (state) {
    return state.managedCountries.map(c => c.code)
  }
}

export const mutations = {
  [SET_STATE] (state, changes) {
    Object.entries(changes).forEach(([key, val]) => {
      if (key in state) {
        state[key] = val
      }
    })
  }
}

export const actions = {
  getCountries ({ commit }) {
    return this.$repos.countryRepo.getCountries().then((countries) => {
      commit(SET_STATE, { countries })
    })
  },

  getMyCountryCode ({ commit }) {
    return this.$repos.countryRepo.getMyCountryCode().then((code) => {
      commit(SET_STATE, { myCountryCode: code })
      return code
    })
  },

  getCountrySettings ({ commit }) {
    return this.$repos.countryRepo.getCountrySettings().then((response) => {
      if (response.success) {
        commit(SET_STATE, { countrySettings: response.data.countries })
      }
      return response
    })
  },

  getManagedCountries ({ commit }) {
    return this.$repos.countryRepo.getManagedCountries()
      .then(managedCountries => commit(SET_STATE, { managedCountries }))
  }
}

for (const entityType of entityTypes) {
  const upperEntityType = upperFirst(entityType)
  const GET_LIST_ACTION = `get${upperEntityType}List`
  const MUTATE_ACTION = `mutate${upperEntityType}`
  const ACTIVATE_ACTION = `activate${upperEntityType}`
  const REMOVE_ACTION = `remove${upperEntityType}`

  Object.assign(actions, {
    [GET_LIST_ACTION] ({ commit, state }, { countryId, reset = true }) {
      reset && commit(SET_STATE, { areas: [], contract: null })

      return this.$repos.settingsRepo[entityType].get(countryId || state.tmpCountryId).then((res) => {
        const areas = res.data.areas.map(({ data: items = [], prefix, ...metadata }) => {
          return {
            ...metadata,
            title: this.$i18n.t(metadata.key),
            prefix: this.$i18n.t(prefix),
            items: sortByStatus({ items, sortBy: ['active', 'draft', 'expired'], sortField: 'status' })
          }
        })

        commit(SET_STATE, {
          areas,
          contract: res.data.contract || null,
          tmpCountryId: countryId || state.tmpCountryId
        })

        return areas
      })
    },

    [MUTATE_ACTION] ({ dispatch }, payload) {
      return this.$repos.settingsRepo[entityType].mutate(payload).then((res) => {
        res.success && dispatch(GET_LIST_ACTION, { reset: false })
        return res
      })
    },

    [ACTIVATE_ACTION] ({ dispatch }, id) {
      return this.$repos.settingsRepo[entityType].activate(id).then((res) => {
        res.success && dispatch(GET_LIST_ACTION, { reset: false })
        return res
      })
    },

    [REMOVE_ACTION] ({ dispatch }, id) {
      return this.$repos.settingsRepo[entityType].remove(id).then((res) => {
        res.data.success && dispatch(GET_LIST_ACTION, { reset: false })
        return res.data
      })
    }
  })
}

Object.assign(actions, {
  getVatRateList ({ commit, state }, { countryId, reset = true }) {
    reset && commit(SET_STATE, { vatRates: [] })

    return this.$repos.settingsRepo.vatRate.get(countryId || state.tmpCountryId)
      .then(response => commit(SET_STATE, {
        vatRates: response.data.vatRates.sort((a, b) => b.vat - a.vat).map(v => ({
          ...v,
          text: `${v.vat}%${v.shortDescription ? ' - ' + v.shortDescription : ''}`
        })),
        tmpCountryId: countryId
      }))
  }
})

function sortByStatus ({ items, sortBy, sortField }) {
  items.reverse()
  const sortByObject = sortBy.reduce((obj, item, index) => {
    return {
      ...obj,
      [item]: index
    }
  }, {})
  return items.sort((a, b) => sortByObject[a[sortField]] - sortByObject[b[sortField]])
}
