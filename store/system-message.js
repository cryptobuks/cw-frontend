const SET_STATE = 'setState'
const RECEIVE_MESSAGE = 'receiveMessage'
const REMOVE_MESSAGE = 'removeMessage'

export const state = () => ({
  messages: []
})

export const mutations = {
  [SET_STATE] (state, changes) {
    Object.entries(changes).forEach(([key, val]) => {
      if (key in state) {
        state[key] = val
      }
    })
  },

  [RECEIVE_MESSAGE] (state, msg) {
    const i = state.messages.findIndex(m => m._id === msg._id)
    if (i === -1) {
      state.messages.push(msg)
    } else {
      state.messages.splice(i, 1, msg)
    }
  },

  [REMOVE_MESSAGE] (state, id) {
    const i = state.messages.findIndex(m => m._id === id)
    i !== -1 && state.messages.splice(i, 1)
  }
}

export const actions = {
  fetchMessages ({ commit }) {
    return this.$repos.settingsRepo.message.get().then((res) => {
      commit(SET_STATE, { messages: res.data.messages })
    })
  },

  mutateMessage ({ commit }, payload) {
    return this.$repos.settingsRepo.message.mutate(payload)
      .then((res) => {
        res.success && commit(RECEIVE_MESSAGE, res.data.message)
        return res
      })
  },

  removeMessage ({ commit }, id) {
    return this.$repos.settingsRepo.message.remove(id)
      .then((res) => {
        res.success && commit(REMOVE_MESSAGE, id)
        return res
      })
  },

  downloadMessages (_, locale) {
    return this.$repos.settingsRepo.message.export(locale)
  },

  uploadMessages ({ dispatch }, base64CSV) {
    return this.$repos.settingsRepo.message.import({ content: base64CSV })
      .then((res) => {
        res.success && dispatch('fetchMessages')
        return res
      })
  }
}
