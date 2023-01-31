export default ({ $socket, $axios }) => ({
  assignContact: ({ gymId, toProfile, profileId }) =>
    $socket
      .request('company/auth/assignProfile', { gymId, toProfile, profileId })
      .then(response => response.data),
  blockOrUnblockContact: (profileId, block = true) =>
    $socket.request(`relation/auth/${block ? 'block' : 'unblock'}`, {
      profileId
    }),
  exportContacts: () =>
    $axios.$get('/api/auth/profile/export').then(res => res.data?.content),
  getBusinessUsers: gymId =>
    $socket
      .request('company/auth/gymBusinessUsers', { gymId })
      .then(response => response.data),
  getUnassignedContacts: gymId =>
    $socket
      .request('company/auth/gymUnassignedUser', { gymId })
      .then(response => response.data),
  importContacts: content =>
    $axios.$post('/api/auth/profile/import', { content }),
  unassignProfile: ({ gymId, toProfile, profileId }) =>
    $socket
      .request('company/auth/unassignProfile', { gymId, toProfile, profileId })
      .then(response => response.data),
  verifyContactRelationship: (leftProfileId, rightProfileId) =>
    $socket
      .request('relation/auth/verifyUserRelationShip', {
        leftProfileId,
        rightProfileId
      })
      .then(response => response.data)
})
