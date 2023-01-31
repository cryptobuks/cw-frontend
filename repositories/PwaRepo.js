export default ctx => ({
  installPwa () {
    return ctx.$socket.request('profile/auth/setPwa', {})
  },

  loginByToken (cwtoken) {
    return ctx.$axios.$post('/api/auth/profile/token', { cwtoken })
  }
})
