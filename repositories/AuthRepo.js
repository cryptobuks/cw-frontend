export default ctx => ({
  register (payload) {
    return ctx.$axios.$post('/api/auth/profile/signup', payload)
  },

  login (payload) {
    return ctx.$axios.$post('/api/auth/profile/login', payload, { toast: false })
  },

  logout () {
    return ctx.$axios.$post('/api/auth/profile/logout', {}, { toast: false })
  },

  resetPasswordByEmail (email) {
    return ctx.$axios.$post('/api/auth/profile/password-reset/email', { username: email }, { toast: false })
  },

  resetPasswordByMobile ({ countryCode, phoneNumber, prefixNumber } = {}) {
    return ctx.$axios.$post('/api/auth/profile/password-reset/mobileNo', { countryCode, phoneNumber, prefixNumber }, { toast: false })
  },

  resetPasswordByPin (pin) {
    return ctx.$axios.$post('/api/auth/profile/password-reset/pin', { pin }, { toast: false })
  },

  setNewPassword ({ newPassword, token }) {
    return ctx.$axios.$post('/api/auth/profile/password-reset/update', { password: newPassword, cwtoken: token })
  },

  getEmancipationAge (countryCode) {
    return ctx.$axios.$post('/api/auth/profile/emancipation-age', { countryCode })
      .then(res => res?.data?.emancipationAge || 0)
  }
})
