export default ({ $axios, app, route }) => {
  $axios.onError((error) => {
    let message = 'Something went wrong.'
    if (!error.response) {
      return error
    }

    if ([400, 422].includes(error.response?.status)) {
      /**
       * This need to be uncommented when translations are available.
       */

      // const errors = error.response.data.errors
      // for (const field of Object.keys(errors)) {
      //   message = errors[field][0]
      //   break
      // }
      message = error.response.data.message
    }

    if (error.response?.config.toast !== false && process.client && message) {
      app.$notifier.error(message)
    }

    return error
  })

  $axios.onResponse((response) => {
    if (response.config.toast !== false && response.data && response.data.success === false && process.client) {
      app.$notifier.error(response.data.message || '')
    }

    return response
  })
}
