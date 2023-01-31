export default (ctx, inject) => {
  const DEFAULT_TIMEOUT = 30000

  class Socket extends WebSocketAdapter {
    constructor () {
      const connectionUrl = ctx.$config.webSocketUrl + (ctx.$pwa.isStandalone ? '?pwa=true' : '')
      super(connectionUrl)
    }

    request (uri, payload, opts) {
      const [module, service, action] = uri.split('/')
      return this.sendAndRead({
        module,
        service,
        action,
        payload
      }, opts)
    }

    async sendAndRead (obj = {}, opts = {}) {
      this.connectionPromise && await this.connectionPromise

      return new Promise((resolve, reject) => {
        const { ...requestPayload } = obj

        requestPayload.replyTo = Date.now() + '-' + (Math.floor(Math.random() * 1000))

        const timeoutId = setTimeout(() => {
          this.off(requestPayload.replyTo)
          this._onSendAndReadReplied({ success: false, message: 'Error timeout read reply' })
          resolve({})
        }, opts.timeout || DEFAULT_TIMEOUT)

        this.once(requestPayload.replyTo, (payload) => {
          clearTimeout(timeoutId)
          this._onSendAndReadReplied(payload, opts)
          resolve(payload)
        })

        this.send(requestPayload)
      })
    }

    // Display global error toast on request error
    _onSendAndReadReplied (payload, opts) {
      if (payload?.message && payload?.success === false && opts?.toast !== false) {
        ctx.$notifier.error(ctx.app.i18n.t(payload?.message))
      }
    }

    _onMessage (event) {
      if (event.data?.length) {
        if (event.data.substr(0, 6) === 'LOGOUT') {
          this.disconnect()
          return this.emit('LOGOUT')
        } else if (event.data === 'pong') {
          return true
        }

        let msg = null
        try {
          msg = JSON.parse(event.data)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('[SOCKET]', 'Error parse data from socket', event.data)
        }
        if (!msg) {
          return
        }

        const { payload, module, service, action, replyId } = msg

        if (this._listeners[replyId]) {
          this.emit(replyId, payload)
        } else if (module && service && action) {
          this.emit(`${module}/${service}/${action}`, payload)
          this.emit(`${module}/${service}`, { action, payload })
        }
      }
    }

    _onConnected () {
      this.emit('CONNECTED')
    }
  }

  const socket = new Socket()

  // Register vuex store modules as handler
  socket.on('message/chat', ({ action, payload }) => ctx.store.dispatch('chat/' + action, payload))
  socket.on('chat/chat', ({ action, payload }) => ctx.store.dispatch('chat/' + action, payload))
  socket.on('groupMessage/chat', ({ action, payload }) => ctx.store.dispatch('chat/' + action, payload))

  // Inject
  inject('socket', socket)
}

class Listener {
  constructor () {
    this._listeners = {}
  }

  on (event, cb) {
    if (!event || typeof event !== 'string' || typeof cb !== 'function') {
      return
    }

    if (!this._listeners[event]) {
      this._listeners[event] = [cb]
    } else if (!this._listeners[event].includes(cb)) {
      this._listeners[event].push(cb)
    }
  }

  once (event, cb) {
    const patchedCb = (payload) => {
      this.off(event, patchedCb)
      cb(payload)
    }

    this.on(event, patchedCb)
  }

  off (event, cb) {
    if (!cb) {
      delete this._listeners[event]
      return
    }

    const i = this._listeners[event]?.indexOf?.(cb) || -1
    if (i !== -1) {
      this._listeners[event].splice(i, 1)

      if (!this._listeners[event].length) {
        delete this._listeners[event]
      }
    }
  }

  emit (event, payload, opts) {
    this._listeners[event]?.forEach?.(listener => listener(payload, opts))
  }
}

class WebSocketAdapter extends Listener {
  constructor (connectionUrl) {
    super()

    this.connectionUrl = connectionUrl?.startsWith?.('/')
      ? `${location.protocol.startsWith('https') ? 'wss' : 'ws'}://${window.location.host}` + connectionUrl
      : connectionUrl

    this.ws = null
    this.pingTimeout = null
    this.connectionTimeout = null
    this.connectionPromise = null
    this.connectionPromiseResolve = null
    this.disconnected = true
  }

  startPing () {
    this.pingTimeout = setTimeout(() => {
      this.ws.send('ping')
    }, 15 * 1000)
  }

  stopPing () {
    clearTimeout(this.pingTimeout)
  }

  resetPing () {
    this.stopPing()
    this.startPing()
  }

  resetConnectionTimeout () {
    clearTimeout(this.connectionTimeout)
    this.connectionTimeout = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('[SOCKET]', 'Timeout connection - restart')
      this.reconnect()
    }, 20 * 1000)
  }

  connect () {
    if (this.ws) {
      return
    }

    try {
      this.ws = new WebSocket(this.connectionUrl)
      this.disconnected = false
      this.registerSocketEvents()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[SOCKET]', 'Connection error', error)
    }
  }

  reconnect () {
    if (this.disconnected) {
      return
    }
    // eslint-disable-next-line no-console
    console.log('[SOCKET]', 'Try to reconnect...')
    this.disconnect()
    this.connect()
  }

  disconnect () {
    this.disconnected = true
    this.ws?.close?.()
    this.ws = null
  }

  async send (obj) {
    this.connectionPromise && await this.connectionPromise
    this.ws.send(JSON.stringify(obj))
  }

  registerSocketEvents () {
    this.connectionPromise = new Promise((resolve, reject) => {
      this.connectionPromiseResolve = resolve
    })

    this.ws.onmessage = (event) => {
      this._onMessage(event)

      this.resetPing()
      this.resetConnectionTimeout()
    }

    this.ws.onerror = (event) => {
      // eslint-disable-next-line no-console
      console.log('[SOCKET]', 'Error', event)
      setTimeout(() => this.reconnect(), 3000)
    }

    this.ws.onopen = (event) => {
      this.connectionPromiseResolve?.()
      this.connectionPromise = this.connectionPromiseResolve = null
      this._onConnected()
      this.startPing()
    }

    this.ws.onclose = (event) => {
      this.stopPing()
    }
  }

  _onMessage (evt) {}

  _onConnected () {}
}
