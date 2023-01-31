export default (ctx) => {
  return {
    backgroundImageStat () {
      return ctx.$socket.request('internalStats/stats/getBackgroundStats', {}).then(
        res => res.data
      )
    },
    countryStats () {
      return ctx.$socket.request('internalStats/stats/getCountryStats', {}).then(
        res => res.data
      )
    },
    getSportInterestStats () {
      return ctx.$socket.request('internalStats/stats/getSportInterestStats', {}).then(
        res => res.data
      )
    },
    getContactsMonth () {
      return ctx.$socket.request('internalStats/stats/getContactsMonth', {}).then(
        res => res.data
      )
    },
    getSportContactsMonth () {
      return ctx.$socket.request('internalStats/stats/getSportContactsMonth', {}).then(
        res => res.data
      )
    },
    getContactsStats (payload) {
      return ctx.$socket.request('internalStats/stats/getContactsStats', payload).then(
        res => res.data
      )
    },
    getSportContactsStats (payload) {
      return ctx.$socket.request('internalStats/stats/getSportContactsStats', payload).then(
        res => res.data
      )
    },
    getAcquisitionContactsMonth (payload) {
      return ctx.$socket.request('internalStats/stats/getAcquisitionContactsMonth', payload).then(
        res => res.data
      )
    },
    getAcquisitionContactsStats (payload) {
      return ctx.$socket.request('internalStats/stats/getAcquisitionContactsStats', payload).then(
        res => res.data
      )
    },
    getTrendContactsMonth (payload) {
      return ctx.$socket.request('internalStats/stats/getTrendContactsMonth', payload).then(
        res => res.data
      )
    },
    getTrendContactsStats (payload) {
      return ctx.$socket.request('internalStats/stats/getTrendContactsStats', payload).then(
        res => res.data
      )
    },
    cardStats (payload) {
      return ctx.$socket.request('internalStats/stats/cardStats', payload).then(
        res => res.data
      )
    }
  }
}
