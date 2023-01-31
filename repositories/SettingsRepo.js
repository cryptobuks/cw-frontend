export default ({ $socket, $utils }) => ({
  ageTarget: {
    get (countryId) {
      return $socket.request('ageTarget/settings/getCountry', { countryId })
    },

    mutate (ageTarget) {
      return $socket.request('ageTarget/settings/updateCountry', ageTarget)
    }
  },

  background: {
    get: () => $socket.request('background/settings/getBackgrounds', {}),

    mutate: payload => $socket.request(`background/settings/${payload._id ? 'update' : 'create'}Background`, payload),

    remove: _id => $socket.request('background/settings/removeBackground', { _id }),

    getOneById: _id => $socket.request('background/settings/getBackground', { _id }).then(res => res.data)
  },

  calendar: {
    get: () => $socket.request('setting/calendar/getSettings', {}).then(response => response.data),
    getDefault: () => $socket.request('setting/calendar/getDefaultSettings', {}).then(response => response.data),
    set: ({ id, options }) => $socket.request('setting/calendar/setSettings', { id, options })
  },

  commercialContract: {
    activate: _id => $socket.request('commercialContract/settings/activateContract', { _id }),

    mutate: payload => $socket.request(`commercialContract/settings/${payload._id ? 'update' : 'create'}Contract`, payload),

    get: countryId => $socket.request('commercialContract/settings/getContract', { countryId }),

    remove: _id => $socket.request('commercialContract/settings/removeContract', { _id })
  },

  country: {
    get: () => $socket.request('countries/settings/getCountries', {})
  },

  language: {
    get: () => $socket.request('i18n/settings/getLanguages', {})
  },

  message: {
    get: () => $socket.request('messages/settings/getMessages', {}),

    mutate: payload => $socket.request(`messages/settings/${payload._id ? 'update' : 'create'}Message`, payload),

    remove: _id => $socket.request('messages/settings/removeMessage', { _id }),

    export: language => $socket.request('messages/settings/exportTranslations', { language }),

    import: content => $socket.request('messages/settings/importTranslations', content)
  },

  paymentTerm: {
    mutate: payload => $socket.request(`termsOfPayment/settings/${payload._id ? 'update' : 'create'}TermsOfPayment`, payload),

    get: () => $socket.request('termsOfPayment/settings/getTermsOfPayments', {}),

    remove: _id => $socket.request('termsOfPayment/settings/removeTermsOfPayment', { _id })
  },

  priceList: {
    activate: _id => $socket.request('priceList/settings/activatePriceList', { _id }),

    mutate: payload => $socket.request(
      `priceList/settings/${payload._id ? 'update' : 'create'}PriceList`,
      $utils.extract(
        payload,
        ['area', 'priceList', 'countryId', 'description', 'forYear', 'oneOff'],
        { ignoreNull: true }
      )
    ),

    get: countryId => $socket.request('priceList/settings/getPriceList', { countryId }),

    remove: _id => $socket.request('priceList/settings/removePriceList', { _id })
  },

  privacyPolicy: {
    activate: _id => $socket.request('privacyPolicy/settings/activatePrivacyPolicy', { _id }),

    mutate: payload => $socket.request(`privacyPolicy/settings/${payload._id ? 'update' : 'create'}PrivacyPolicy`, payload),

    get: countryId => $socket.request('privacyPolicy/settings/getPrivacyPolicy', { countryId }),

    remove: _id => $socket.request('privacyPolicy/settings/removePrivacyPolicy', { _id })
  },

  roleDocuments: {
    activate: _id => $socket.request('roleDocuments/settings/activateRoleDocuments', { _id }),

    mutate: payload => $socket.request(`roleDocuments/settings/${payload._id ? 'update' : 'create'}RoleDocument`, payload),

    get: countryId => $socket.request('roleDocuments/settings/getRoleDocuments', { countryId }),

    remove: _id => $socket.request('roleDocuments/settings/removeRoleDocument', { _id })
  },

  sportInterest: {
    get: () => $socket.request('sportInterest/settings/getSportInterests', {}),

    mutate: payload => $socket.request(`sportInterest/settings/${payload._id ? 'update' : 'create'}SportInterest`, payload),

    remove: _id => $socket.request('sportInterest/settings/SportInterest', { _id })
  },

  termsAndConditions: {
    activate: _id => $socket.request('termsAndConditions/settings/activateTermsAndConditions', { _id }),

    mutate: payload => $socket.request(`termsAndConditions/settings/${payload._id ? 'update' : 'create'}TermsAndConditions`, payload),

    get: countryId => $socket.request('termsAndConditions/settings/getTermsAndConditions', { countryId }),

    remove: _id => $socket.request('termsAndConditions/settings/removeTermsAndConditions', { _id })
  },

  translation: {
    get: () => $socket.request('i18nEntry/settings/getTranslations', {}),

    mutate: payload => $socket.request('i18nEntry/settings/updateTranslation', payload),

    import: content => $socket.request('i18nEntry/settings/importTranslations', content),

    export: language => $socket.request('i18nEntry/settings/exportTranslations', { language })
  },

  vatRate: {
    activate: _id => $socket.request('vatRate/settings/activateVatRate', { _id }),

    mutate: payload => $socket.request(`vatRate/settings/${payload._id ? 'update' : 'create'}VatRate`, payload),

    get: countryId => $socket.request('vatRate/settings/getVatRates', { countryId }),

    remove: _id => $socket.request('vatRate/settings/removeVatRate', { _id })
  }
})
