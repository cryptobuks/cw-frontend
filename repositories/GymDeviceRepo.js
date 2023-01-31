export default (ctx) => {
  return {
    getGymDevices (gymId) {
      return ctx.$socket.request('device/auth/getDeviceByGymId', { gymId })
        .then(res => res?.data || [])
    },

    mutateGymDevice (device) {
      return ctx.$socket.request('device/auth/' + (device._id ? 'deviceEdit' : 'deviceAdd'), device)
        .then(res => res.success && res.data)
    },

    removeGymDevice ({ gymId, _id }) {
      return ctx.$socket.request('device/auth/deviceDelete', { gymId, _id })
    },

    resetGymDevice ({ gymId, _id }) {
      return ctx.$socket.request('device/auth/deviceReset', { gymId, _id })
        .then(res => res.success && res.data)
    },

    login ({ gymId, deviceId }) {
      return ctx.$axios.$get(`/api/auth/device/login/${gymId}/${deviceId}`)
    },

    getQrCodeForDevice (payload = {}) {
      return ctx.$socket.request('device/auth/getQrCodeForDevice', payload)
        .then(res => res.success && JSON.stringify(res.data))
    },

    verifyUserRelation (profileId) {
      return ctx.$socket.request('device/auth/verifyUserRelation', { scanId: profileId })
        .then(res => res.success && res.data)
    },

    createRelation (profileId) {
      return ctx.$socket.request('device/auth/createRelation', { scanId: profileId })
        .then(res => res.success === true)
    },

    scanAccess (profileId) {
      return ctx.$socket.request('device/auth/deviceScanAccess', { profileId })
        .then(res => res.success === true)
    },

    resetPassword (payload) {
      return ctx.$socket.request('device/auth/passwordReset', ctx.$utils.extract(
        payload,
        [
          'profileId',
          { from: 'dob', transform: dob => +ctx.$dayjs(dob).format('YYYYMMDD') },
          { from: 'password', transform: p => window.btoa(p) }
        ],
        { ignoreNull: true }
      ))
        .then(res => res.success === true)
    },

    sendToDevice (payload) {
      return ctx.$socket.request('company/auth/sendToDevice', ctx.$utils.extract(payload, ['gymId', 'deviceId', 'action', 'data']))
        .then(res => res.success === true)
    },

    askInfo (payload) {
      return ctx.$socket.request('device/auth/askInfo', payload)
    },

    bookShift (payload) {
      return ctx.$socket.request('device/auth/bookShift', payload)
    },

    cancelShift (userId) {
      return ctx.$socket.request('device/auth/cancelShift', { userId })
    }
  }
}
