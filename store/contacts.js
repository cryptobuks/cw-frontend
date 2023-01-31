export const state = () => ({
  businessUsers: []
})

export const mutations = {
  SET_BUSINESS_USERS (state, val) {
    state.businessUsers = val
  }
}

export const actions = {
  getBusinessUsers ({ commit }) {
    return this.$repos.contactsRepo.getBusinessUsers(
      this.$auth.user._id
    )
      .then((res) => {
        commit('SET_BUSINESS_USERS', res)
      })
  }
}
