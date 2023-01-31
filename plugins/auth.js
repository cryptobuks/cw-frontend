import Vue from 'vue'

const AUTH_KEY = 'cw_auth'
const DEVICE_AUTH_KEY = 'cw_auth:device'
const PWA_LOGGED_OUT_FLAG_KEY = 'cw:pwa:log_out'

const DEFAULT_BG = {
  files: {
    landscape: {
      url: '/background/default-l.jpg'
    },
    portrait: {
      url: '/background/default-p.jpg'
    }
  }
}

export const PROFILE_TYPES = {
  IN: {
    profile: 'Individual',
    canLogin: true,
    canBeManaged: false,
    managedBy: [],
    interface: 'user'
  },
  TU: {
    profile: 'Tutored',
    canLogin: true,
    canBeManaged: true,
    managedBy: ['TT'],
    interface: 'user'
  },
  CO: {
    profile: 'Company',
    canLogin: false,
    canBeManaged: true,
    managedBy: ['RE'],
    interface: 'user'
  },
  CH: {
    profile: 'CW HQ',
    canLogin: false,
    canBeManaged: true,
    managedBy: ['DI', 'OP', 'TR', 'SA'],
    interface: 'business',
    contractArea: 'cw'
  },
  CW: {
    profile: 'CW',
    canLogin: false,
    canBeManaged: true,
    managedBy: ['DI', 'OP', 'TR', 'SA'],
    interface: 'business',
    contractArea: 'cw'
  },
  CU: {
    profile: 'CW Unit',
    canLogin: false,
    canBeManaged: true,
    managedBy: ['DI', 'OP', 'TR', 'SA'],
    interface: 'business',
    contractArea: 'cw'
  },
  GH: {
    profile: 'GYM HQ',
    canLogin: false,
    canBeManaged: true,
    managedBy: ['DI', 'OP', 'TR', 'SA'],
    interface: 'business',
    contractArea: 'gym'
  },
  GY: {
    profile: 'GYM',
    canLogin: false,
    canBeManaged: true,
    managedBy: ['DI', 'OP', 'TR', 'SA'],
    interface: 'business',
    contractArea: 'gym'
  },
  GU: {
    profile: 'GYM Unit',
    canLogin: false,
    canBeManaged: true,
    managedBy: ['DI', 'OP', 'TR', 'SA'],
    interface: 'business',
    contractArea: 'gym'
  },
  SI: {
    profile: 'Sport Institution',
    canLogin: false,
    canBeManaged: true,
    managedBy: ['DI', 'OP', 'TR', 'SA'],
    interface: 'business',
    contractArea: 'gym'
  }
}

export default async (ctx, inject) => {
  const auth = Vue.observable({
    isAuthenticated: false,
    user: null,
    token: null,
    expiresAt: null,
    countryCode: null,
    background: {},
    bgImage () {
      const format = ctx.$mq === 'mobile' ? 'portrait' : 'landscape'
      if (!auth.isAuthenticated || !auth.background.files) {
        return DEFAULT_BG.files[format].url
      }
      return auth.background.files[format].url
    },

    async login ({ token, expiresAt } = {}, silent = false) {
      if (!token) {
        return
      }

      const exp = expiresAt ||
        ctx.$utils.parseJSON(window.atob(token?.split?.('.')[1]))?.exp * 1000
      if (!exp) {
        return
      }

      Object.assign(auth, {
        isAuthenticated: true,
        token,
        expiresAt: exp
      })

      handleExpiration()
      if (!auth.isAuthenticated) {
        return
      }

      ctx.$socket.connect()
      ctx.$socket.on('LOGOUT', onForceLogout)

      // Get auth.user from API on page load and login
      await ctx.$repos.profileRepo.getMyProfile().then(async (user) => {
        await auth.updateUser(user)

        // Update auth.user on user changes from other devices, skip for gym device
        if (!ctx.$pwa.isGymDevice) {
          ctx.$socket.on('profile/auth/detail', res => auth.updateUser(res.data))
        }
      })

      if (!silent) {
        persitState()

        if (auth.isGuestRoute()) {
          const params = new URLSearchParams(location.search)
          const targetUri = params.get('target_uri')
          if (targetUri) {
            // For auto redirect to authenticated route after login
            ctx.app.router.push(decodeURIComponent(targetUri))
          } else {
            // For handling QR code params in home page
            ctx.app.router.push('/' + location.search)
          }
        }
      }

      ctx.app.i18n.setLocale(auth.user?.settings?.language || 'en')

      ctx.store.commit('chat/REFRESH_STORE')
      ctx.store.commit('linkPreview/CLEAR_OLD_LINK_PREVIEW')
      ctx.store.dispatch('chat/getFilterTarget')
      ctx.store.dispatch('chat/getReactionsList')
      ctx.store.dispatch('chat/loadChatsAndMessages')
    },

    logout () {
      Object.assign(auth, {
        isAuthenticated: false,
        user: null,
        token: null,
        expiresAt: null
      })

      ctx.$socket.disconnect()

      persitState()

      if (!auth.isGuestRoute() && !auth.isPublicRoute()) {
        ctx.app.router.push('/login')
      }

      if (auth._timeout) {
        clearTimeout(auth._timeout)
        delete auth._timeout
      }

      ctx.store.commit('chat/REFRESH_STORE')
    },

    async updateUser (payload) {
      if (auth.background?.id !== payload.settings?.background?.id) {
        const bg = await ctx.$repos.settingsRepo.background
          .getOneById(payload.settings?.background?.id)
        Vue.set(auth, 'background', bg.background)
      }

      const user = { ...auth.user, ...payload }
      Object.assign(auth, {
        user,
        countryCode: user.company?.addresses?.[0]?.addressComponents?.country?.short?.toLowerCase?.() ||
          user.person?.addresses?.[0]?.addressComponents?.country?.short?.toLowerCase?.() ||
          null
      })

      persitState()
    },

    isGuestRoute () {
      return checkRouteAuthOption(ctx.route, 'guest')
    },

    isPublicRoute () {
      return checkRouteAuthOption(ctx.route, false)
    },

    getRouteAuthOptions () {
      const values = []
      ctx.route.matched.forEach(m =>
        Object.values(m.components).forEach((component) => {
          values.push(component.options?.auth)
        })
      )
      return values
    },

    profileType (typeCode) {
      return PROFILE_TYPES[typeCode || auth.user?.typeCode]
    },

    isBusiness (typeCode) {
      return auth.profileType(typeCode)?.interface === 'business'
    },

    isUser (typeCode) {
      return auth.profileType(typeCode)?.interface === 'user'
    },

    isCW (typeCode) {
      return ['CH', 'CW', 'CU'].includes(typeCode)
    }
  })

  inject('auth', auth)

  // Logout on Unauthorized axios request
  ctx.$axios.onResponseError((error) => {
    if (
      auth.isAuthenticated &&
      error.response &&
      error.response.status === 401
    ) {
      auth.logout()
    }
  })

  // Init auth state
  const payload = ctx.$utils.parseJSON(localStorage.getItem(getAuthKey()))

  if (payload?.token) {
    await auth.login(payload, true)
  } else if (ctx.$pwa.isStandalone && !localStorage.getItem(PWA_LOGGED_OUT_FLAG_KEY)) {
    // Handle auto login for pwa
    const searchParam = new URLSearchParams(location.search)
    const token = searchParam.get('token')
    if (token) {
      try {
        await ctx.$repos.pwaRepo.loginByToken(token)
        await auth.login({ token })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    }
  }

  /**
   * Persit authenticated data in local storage
   * @returns void
   */
  function persitState () {
    const authKey = getAuthKey()

    sendAuthToServiceWorker()

    if (ctx.$pwa.isStandalone) {
      // Stop the autologin feature of pwa
      localStorage.setItem(PWA_LOGGED_OUT_FLAG_KEY, true)
    }

    if (!auth.isAuthenticated) {
      localStorage.removeItem(authKey)
      return
    }

    const payload = JSON.stringify({
      token: auth.token,
      expiresAt: auth.expiresAt,
      user: {
        _id: auth.user?._id,
        typeCode: auth.user?.typeCode
      }
    })

    localStorage.setItem(authKey, payload)
  }

  // The cw-sw.js intercepts this request and save the payload for later use
  async function sendAuthToServiceWorker () {
    await ctx.$pwa.serviceWorkerReady()

    const payload = auth.isAuthenticated
      ? { profileId: auth.user._id, token: auth.token }
      : {}

    await fetch('sw/auth', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    await ctx.$pwa.refreshManifestLink()
  }

  function handleExpiration () {
    if (!auth.isAuthenticated) {
      return
    }

    if (!auth.expiresAt) {
      auth.logout()
      return
    }

    if (auth._timeout) {
      clearTimeout(auth._timeout)
    }

    const ms = Math.max(0, auth.expiresAt - Date.now())
    // If less than 12 hours
    if (ms < 43200000) {
      auth._timeout = setTimeout(auth.logout, ms - 1000)
    }
  }

  function onForceLogout () {
    ctx.$notifier.error('Your session is expired')
    auth.logout()
  }

  function checkRouteAuthOption (route, value) {
    return route.matched.some(m =>
      Object.values(m.components).some(
        component => component.options && component.options.auth === value
      )
    )
  }

  function getAuthKey () {
    // For android, some browser share the storage with the pwa so need to use
    // different key when in gym device mode
    return ctx.$pwa.isGymDevice ? DEVICE_AUTH_KEY : AUTH_KEY
  }
}
