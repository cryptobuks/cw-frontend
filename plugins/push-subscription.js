import { isSafari } from './utils'

export default function (ctx, inject) {
  const isSupported = !isSafari && 'serviceWorker' in navigator && 'Notification' in window

  inject('push', {
    isSupported,

    hasActiveSubscription () {
      return isSupported && navigator.serviceWorker.ready.then(async (registration) => {
        return !!(await registration.pushManager?.getSubscription?.())
      })
    },

    subscribe () {
      return isSupported && Notification.requestPermission()
        .then((permission) => {
          if (permission === 'granted') {
            createSubscription()
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log('[PUSH]', err)
        })
    },

    unsubscribe () {
      return isSupported && navigator.serviceWorker.ready.then(async (registration) => {
        const sub = await registration.pushManager?.getSubscription?.()
        return sub?.unsubscribe?.()
      })
    }
  })

  function createSubscription () {
    return navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager?.subscribe?.({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(ctx.$config.vapidKey)
      })

      subscription && await ctx.$socket.request('subscriptions/notifications/createSubscription', {
        subscription
      }).then(res => res.success === true || subscription.unsubscribe())
    })
  }

  function urlBase64ToUint8Array (base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}
