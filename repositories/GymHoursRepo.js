export default (ctx) => {
  function request (
    action,
    payload,
    { module = 'openingHours', service = 'calendar' } = {}
  ) {
    return ctx.$socket.sendAndRead({
      module,
      service,
      action,
      payload
    })
  }
  return {
    getGymHours (gymId) {
      return request('getGymWeekDaysAndException', { gymId }).then(
        res => res.data
      )
    },
    setGymHours (gymId, payload) {
      return request('setGymWeekDaysAndException', { gymId, ...payload }).then(
        res => res.data
      )
    }
  }
}
