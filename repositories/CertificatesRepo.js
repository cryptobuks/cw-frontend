export default ({ $socket }) => ({
  approveOrDisapprove: (payload, action = 'approve') =>
    $socket
      .request(`certificates/auth/${action}`, payload)
      .then(response => response.data),
  delete: (id, ownerId) =>
    $socket
      .request('certificates/auth/deleteCertificate', { id, ownerId })
      .then(response => response.data),
  get: (gymId, profileId) =>
    $socket
      .request('certificates/auth/getCertificatesList', {
        profileId,
        gymId
      })
      .then(response => response.data),
  save: payload =>
    $socket
      .request(`certificates/auth/${payload.id ? 'update' : 'create'}`, payload)
      .then(response => response.data)
})
