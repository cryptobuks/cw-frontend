const SET_STATE = 'setState'
const RECEIVE_DEVICE = 'receiveDevice'
const REMOVE_DEVICE = 'removeDevice'

export const state = () => ({
  devices: []
})

export const mutations = {
  [SET_STATE] (state, changes) {
    Object.entries(changes).forEach(([key, val]) => {
      if (key in state) {
        state[key] = val
      }
    })
  },

  [RECEIVE_DEVICE] (state, device) {
    const i = state.devices.findIndex(g => g._id === device._id)
    if (i === -1) {
      state.devices.push(device)
    } else {
      state.devices.splice(i, 1, { ...state.devices[i], ...device })
    }
  },

  [REMOVE_DEVICE] (state, _id) {
    const i = state.devices.findIndex(g => g._id === _id)
    if (i !== -1) {
      state.devices.splice(i, 1)
    }
  }
}

export const actions = {
  getGymDevices ({ commit }, gymId) {
    commit(SET_STATE, { devices: [] })
    return this.$repos.gymDeviceRepo.getGymDevices(gymId)
      .then(devices => commit(SET_STATE, { devices }))
  },

  mutateGymDevice ({ commit }, device) {
    return this.$repos.gymDeviceRepo.mutateGymDevice(device)
      .then(newDevice => newDevice && commit(RECEIVE_DEVICE, newDevice))
  },

  removeGymDevice ({ commit }, device) {
    return this.$repos.gymDeviceRepo.removeGymDevice(device)
      .then(() => commit(REMOVE_DEVICE, device._id))
  },

  resetGymDevice ({ commit }, device) {
    return this.$repos.gymDeviceRepo.resetGymDevice(device)
      .then(newDevice => newDevice && commit(RECEIVE_DEVICE, newDevice))
  }
}
