export default ({ $socket }) => ({
  deletePaymentConfig: id =>
    $socket
      .request('config/payment/deleteConfig', { id })
      .then(res => res.data),
  getPaymentConfig: () =>
    $socket.request('config/payment/getConfig').then(res => res.data),
  getTransactions: (gymId, pagination = { page: 1, limit: 100 }) =>
    $socket
      .request('transaction/wallet/getTransactions', { gymId, ...pagination })
      .then(res => res.data),
  getUserWallet: (gymId, profileId) =>
    $socket
      .request('wallet/wallet/getWallet', { gymId, profileId })
      .then(res => res.data),
  mutatePaymentConfig: payload =>
    $socket
      .request(`config/payment/${payload._id ? 'update' : 'create'}Config`, {
        ...payload,
        paymentId: payload._id
      })
      .then(res => res.data),
  setPlafond: (creditAmount, expiryDate) =>
    $socket
      .request('giftCredit/wallet/sendGiftCredit', { creditAmount, expiryDate })
      .then(res => res.data)
})
