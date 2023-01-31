import iziToast from 'izitoast'

export default (ctx, inject) => {
  const defaultOpts = {
    class: 'toast',
    close: false,
    icon: null,
    iconColor: '#fff',
    messageColor: '#fff',
    theme: 'dark',
    titleColor: '#fff',
    position: 'bottomRight',
    progressBar: true,
    progressBarColor: '#fafafa',
    timeout: 5000,
    transitionIn: 'fadeInDown',
    zindex: 99999
  }

  const notifier = {
    error (message, { title = 'Error', ...opts } = {}) {
      iziToast.show({
        ...defaultOpts,
        title,
        message,
        close: true,
        timeout: 30000,
        progressBar: false,
        backgroundColor: 'hsl(348, 86%, 61%)',
        ...opts
      })
    },

    success (message, { title = 'Success', ...opts } = {}) {
      iziToast.show({
        ...defaultOpts,
        title,
        message,
        backgroundColor: '#000',
        ...opts
      })
    },

    info (message, { title = 'Info', ...opts } = {}) {
      iziToast.show({
        ...defaultOpts,
        title,
        message,
        backgroundColor: '#4A4DE8',
        ...opts
      })
    },

    warning (message, { title = 'Warning', ...opts } = {}) {
      iziToast.show({
        ...defaultOpts,
        title,
        message,
        backgroundColor: 'hsl(48,  100%, 67%)',
        ...opts
      })
    }
  }

  inject('notifier', notifier)
}
