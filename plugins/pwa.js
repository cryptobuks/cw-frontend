import Vue from 'vue'
import { isSafari, isEdge, isChrome, isIOS, isOpera } from './utils'

const STORAGE_DEVICE_KEY = 'cw:pwa:device'

// More about A2HS
// https://web.dev/customize-install/
// https://ng-chicago.github.io/2018/06/18/add-2-home-screen/

const supportA2HS = !isIOS && !isOpera && (isEdge || isChrome)
const supportManualA2HS = isIOS && isSafari

const pwa = Vue.observable({
  isStandalone: false,
  installed: supportA2HS,
  supportA2HS,
  supportManualA2HS,

  _deferredPrompt: null,

  // Currently being used for gym device
  deviceInfo: null,
  isGymDevice: false,

  setDeviceInfo (deviceInfo) {
    pwa.deviceInfo = deviceInfo
    pwa.isGymDevice = !!deviceInfo
    if (deviceInfo) {
      localStorage.setItem(STORAGE_DEVICE_KEY, JSON.stringify(deviceInfo))
    } else {
      localStorage.removeItem(STORAGE_DEVICE_KEY)
    }
  },

  prompt () {
    return pwa._deferredPrompt?.prompt?.()
  },

  async serviceWorkerReady () {
    // https://pwa.nuxtjs.org/modules/workbox.html#workbox-window
    window.$workbox && await window.$workbox
  },

  // Right after login, the start_url of the manifest.json file need to be updated to include the cwtoken
  // This function aims to re-triggers the fetch request of the manifest file so we can intercept it
  async refreshManifestLink () {
    if (pwa.isStandalone || location.href.startsWith('/device') || !('serviceWorker' in navigator)) {
      return
    }

    const link = document.querySelector('link[rel="manifest"]')
    const parentNode = link.parentNode
    parentNode.removeChild(link)

    await pwa.serviceWorkerReady()

    parentNode.appendChild(link)
  }
})

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  pwa._deferredPrompt = e
  pwa.installed = false
  pwa.supportA2HS = true
})

window.addEventListener('appinstalled', () => {
  pwa.installed = true
})

// Detect standalone mode
const media = window.matchMedia('(display-mode: standalone)')
pwa.isStandalone = navigator.standalone || !!media.matches
media.addEventListener('change', (e) => {
  pwa.isStandalone = !!e.matches
})

export default async function (ctx, inject) {
  const deviceInfo = ctx.$utils.parseJSON(localStorage.getItem(STORAGE_DEVICE_KEY))
  pwa.deviceInfo = deviceInfo?.gymId && deviceInfo?.id ? deviceInfo : null
  pwa.isGymDevice = !!pwa.deviceInfo

  if (navigator.serviceWorker) {
    await navigator.serviceWorker.ready
  }

  inject('pwa', pwa)
}
