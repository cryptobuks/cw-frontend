const initialState = {
  sportInterestsLoaded: false,
  sportInterests: [],

  translationsLoaded: false,
  translations: [],
  languages: [],

  backgroundImages: [],
  backgroundAdvs: [],
  termsOfPayment: []
}

export const state = () => ({
  ...initialState
})

const types = {
  SET_SPORT_INTEREST_LOADED: 'setSportInterestsLoaded',
  SET_SPORT_INTEREST: 'setSportInterests',
  ADD_SPORT_INTEREST: 'addSportInterest',
  UPDATE_SPORT_INTEREST: 'updateSportInterest',
  DELETE_SPORT_INTEREST: 'deleteSportInterest',

  SET_TRANSLATIONS_LOADED: 'setTranslationsLoaded',
  SET_TRANSLATIONS: 'setTranslations',
  UPDATE_TRANSLATION: 'updateTranslation',
  SET_LANGUAGES: 'setLanguages',

  SET_TERMS_OF_PAYMENT: 'setTermsOfPayment',
  ADD_TERM_OF_PAYMENT: 'addTermOfPayment',
  UPDATE_TERM_OF_PAYMENT: 'updateTermOfPayment',
  DELETE_TERM_OF_PAYMENT: 'deleteTermOfPayment',

  SET_BACKGROUND_IMAGES: 'setBackgroundImages',
  ADD_BACKGROUND_IMAGE: 'addBackgroundImage',
  UPDATE_BACKGROUND_IMAGE: 'updateBackgroundImage',
  DELETE_BACKGROUND_IMAGE: 'deleteBackgroundImage',

  SET_BACKGROUND_ADV: 'setBackgroundAdv',
  ADD_BACKGROUND_ADV: 'addBackgroundAdv',
  UPDATE_BACKGROUND_ADV: 'updateBackgroundAdv',
  DELETE_BACKGROUND_ADV: 'deleteBackgroundAdv'
}

export const mutations = {
  [types.SET_SPORT_INTEREST_LOADED] (state, loaded) {
    state.sportInterestsLoaded = loaded
  },
  [types.SET_SPORT_INTEREST] (state, sportInterests) {
    state.sportInterests = sportInterests
  },
  [types.ADD_SPORT_INTEREST] (state, sportInterest) {
    state.sportInterests.push(sportInterest)
  },
  [types.UPDATE_SPORT_INTEREST] (state, sportInterest) {
    replaceArrayItemById(state.sportInterests, sportInterest)
  },
  [types.DELETE_SPORT_INTEREST] (state, id) {
    state.sportInterests = state.sportInterests.filter(img => img._id !== id)
  },

  /* -- Translations Mutations -- */

  [types.SET_TRANSLATIONS_LOADED] (state, loaded) {
    state.translationsLoaded = loaded
  },
  [types.SET_TRANSLATIONS] (state, translations) {
    state.translations = translations
  },
  [types.UPDATE_TRANSLATION] (state, translation) {
    replaceArrayItemById(state.translations, translation, 'key')
  },
  [types.SET_LANGUAGES] (state, languages) {
    state.languages = languages
  },

  /* -- Background Mutations -- */
  [types.SET_BACKGROUND_IMAGES] (state, images) {
    state.backgroundImages = images
  },
  [types.ADD_BACKGROUND_IMAGE] (state, image) {
    state.backgroundImages.push(image)
  },
  [types.UPDATE_BACKGROUND_IMAGE] (state, image) {
    if (image.isDefault) {
      const i = state.backgroundImages.findIndex(b => b.isDefault)
      if (i !== -1 && image._id !== state.backgroundImages[i]._id) {
        state.backgroundImages[i].isDefault = false

        const index = state.backgroundImages.findIndex(i => i._id === image._id)
        state.backgroundImages.splice(index, 1, {
          ...state.backgroundImages[index],
          isDefault: true
        })
      }
    }

    replaceArrayItemById(state.backgroundImages, image)
  },
  [types.DELETE_BACKGROUND_IMAGE] (state, id) {
    state.backgroundImages = state.backgroundImages.filter(img => img._id !== id)
  },

  /* -- Background ADV Mutations -- */
  [types.SET_BACKGROUND_ADV] (state, backgroundAdv) {
    state.backgroundAdvs = backgroundAdv
  },
  [types.ADD_BACKGROUND_ADV] (state, adv) {
    state.backgroundAdvs.push(adv)
  },
  [types.UPDATE_BACKGROUND_ADV] (state, adv) {
    replaceArrayItemById(state.backgroundAdvs, adv)
  },
  [types.DELETE_BACKGROUND_ADV] (state, id) {
    state.backgroundAdvs = state.backgroundAdvs.filter(adv => adv._id !== id)
  },

  /* -- Terms of payment Mutations -- */
  [types.SET_TERMS_OF_PAYMENT] (state, termsOfPayment) {
    state.termsOfPayment = termsOfPayment
  },
  [types.ADD_TERM_OF_PAYMENT] (state, termOfPayment) {
    state.termsOfPayment.push(termOfPayment)
  },
  [types.UPDATE_TERM_OF_PAYMENT] (state, termOfPayment) {
    replaceArrayItemById(state.termsOfPayment, termOfPayment)
  },
  [types.DELETE_TERM_OF_PAYMENT] (state, id) {
    state.termsOfPayment = state.termsOfPayment.filter(term => term._id !== id)
  }
}

export const actions = {

  /* -- Sport Interest Actions -- */

  getSportInterests ({ commit }) {
    return this.$repos.settingsRepo.sportInterest.get()
      .then((response) => {
        if (response.success) {
          commit(types.SET_SPORT_INTEREST_LOADED, true)
          commit(types.SET_SPORT_INTEREST, response.data.sportInterests)
        }

        return response
      })
  },

  saveSportInterest ({ commit }, payload) {
    return this.$repos.settingsRepo.sportInterest.mutate(payload).then((response) => {
      if (response.success) {
        commit(payload._id ? types.UPDATE_SPORT_INTEREST : types.ADD_SPORT_INTEREST, response.data.sportInterest)
      }
      return response
    })
  },

  deleteSportInterest ({ commit }, id) {
    return this.$repos.settingsRepo.sportInterest.remove(id)
      .then((response) => {
        if (response.success) {
          commit(types.DELETE_SPORT_INTEREST, id)
        }
        return response
      })
  },

  /* -- Translations Actions -- */

  getTranslations ({ commit }) {
    return this.$repos.settingsRepo.translation.get()
      .then((response) => {
        if (response.success) {
          commit(types.SET_TRANSLATIONS_LOADED, true)
          commit(types.SET_TRANSLATIONS, response.data.translations)
        }
        return response
      })
  },

  updateTranslation ({ commit }, payload) {
    return this.$repos.settingsRepo.translation.mutate(payload)
      .then((response) => {
        if (response.success) {
          commit(types.UPDATE_TRANSLATION, response.data.translation)
        }
        return response
      })
  },

  getLanguages ({ commit }) {
    return this.$repos.settingsRepo.language.get()
      .then((response) => {
        if (response.success) {
          commit(types.SET_LANGUAGES, response.data.languages)
        }
      })
  },

  /* -- Background Actions -- */

  getBackgroundImages ({ commit }) {
    return this.$repos.settingsRepo.background.get().then((response) => {
      if (response.success) {
        commit(types.SET_BACKGROUND_IMAGES, response.data.backgrounds)
      }
      return response
    })
  },

  saveBackgroundImage ({ commit }, data) {
    return this.$repos.settingsRepo.background.mutate(data).then((response) => {
      if (response.success) {
        commit(data._id ? types.UPDATE_BACKGROUND_IMAGE : types.ADD_BACKGROUND_IMAGE, response.data.background)
      }
      return response
    })
  },

  deleteBackgroundImage ({ commit }, id) {
    return this.$repos.settingsRepo.background.remove(id).then((response) => {
      if (response.success) {
        commit(types.DELETE_BACKGROUND_IMAGE, id)
      }
      return response
    })
  },

  /* -- Background ADV Actions -- */

  getBackgroundAdv ({ commit }, params = {}) {
  },

  createBackgroundAdv ({ commit }, data) {
    commit(types.ADD_BACKGROUND_ADV, data)
  },

  updateBackgroundAdv ({ commit }, data) {
    commit(types.UPDATE_BACKGROUND_ADV, data)
  },

  deleteBackgroundAdv ({ commit }, id) {
    commit(types.DELETE_BACKGROUND_ADV, id)
  },

  /* -- Terms of payment Actions -- */

  getTermsOfPayment ({ commit }) {
    return this.$repos.settingsRepo.paymentTerm.get().then((response) => {
      if (response.success) {
        commit(types.SET_TERMS_OF_PAYMENT, response.data.termsOfPayment)
      }
    })
  },

  saveTermOfPayment ({ commit }, data) {
    return this.$repos.settingsRepo.paymentTerm.mutate(data).then((response) => {
      if (response.success) {
        commit(data._id ? types.UPDATE_TERM_OF_PAYMENT : types.ADD_TERM_OF_PAYMENT, response.data.termOfPayment)
      }
      return response
    })
  },

  deleteTermOfPayment ({ commit }, id) {
    return this.$repos.settingsRepo.paymentTerm.remove(id).then((response) => {
      if (response.success) {
        commit(types.DELETE_TERM_OF_PAYMENT, id)
      }
      return response
    })
  }
}

export const getters = {
  sportInterests: state => state.sportInterests,
  getSport: state => id => state.sportInterests.find(s => s._id === id),
  translations: state => state.translations,
  languages: state => state.languages,
  backgroundImages: state => state.backgroundImages,
  termsOfPayment: state => state.termsOfPayment,
  backgroundAdvs: state => state.backgroundAdvs
}

// Embrace vue reactivity by using splice on array
function replaceArrayItemById (arr, item, key = '_id', shouldReplace = true) {
  const i = arr.findIndex(a => a[key] === item[key])
  if (i !== -1) {
    if (shouldReplace) {
      arr.splice(i, 1, { ...arr[i], ...item })
    } else {
      arr.splice(i, 1)
    }
  }
}
