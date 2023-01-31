import Vue from 'vue'

const defaultOptions = {
  desktop: true,
  mobile: true,
  disabled: false,
  captureBoth: false,
  captureX: false,
  captureY: false,
  onSwipeStart () {},
  onSwipe () {},
  onSwipeEnded () {}
}

Vue.directive('swipe', {
  inserted (el, binding, vnode) {
    el._swiper = new Swiper(el, binding.value, vnode.context)
  },

  componentUpdated (el, binding, vnode) {
    if (binding.oldValue !== binding.value) {
      el._swiper.updateOptions(binding.value, vnode.context)
    }
  }
})

class Swiper {
  constructor (el, bindingValue, vnodeContext) {
    this.el = el
    this.opts = parseOptions(bindingValue, vnodeContext)
    if (!this.opts.captureBoth) {
      this.opts.captureBoth = this.opts.captureX && this.opts.captureY
    }

    this.started = false
    this.changed = false
    this.startX = 0
    this.startY = 0
    this.distanceX = 0
    this.distanceY = 0
    this.towardTop = false
    this.towardLeft = false

    this.onSwipeStart = this.onSwipeStart.bind(this)
    this.onSwipe = this.onSwipe.bind(this)
    this.onSwipeEnd = this.onSwipeEnd.bind(this)

    this.init()
  }

  updateOptions (bindingValue, vnodeContext) {
    this.opts = parseOptions(bindingValue, vnodeContext)

    this.destroy()
    this.init()
  }

  init () {
    if (this.opts.disabled) {
      return
    }

    if (this.opts.desktop) {
      this.el.addEventListener('mousedown', this.onSwipeStart)
    }
    if (this.opts.mobile) {
      this.el.addEventListener('touchstart', this.onSwipeStart)
    }
  }

  destroy () {
    this.el.removeEventListener('mousedown', this.onSwipeStart)
    this.el.removeEventListener('touchdown', this.onSwipeStart)
  }

  onSwipeStart (evt) {
    if (this.started) {
      return
    }

    const { x, y } = getCoord(evt)
    this.started = true
    this.changed = false
    this.startX = x
    this.startY = y
    this.distanceX = this.distanceY = 0
    this.towardLeft = this.towardTop = false

    this.opts.onSwipeStart?.(evt)

    if (this.opts.desktop) {
      document.addEventListener('mousemove', this.onSwipe)
      document.addEventListener('mouseup', this.onSwipeEnd)
    }

    if (this.opts.mobile) {
      document.addEventListener('touchmove', this.onSwipe)
      document.addEventListener('touchend', this.onSwipeEnd)
    }

    evt.stopPropagation()
  }

  onSwipe (evt) {
    if (!this.started) {
      return
    }

    const { x, y } = getCoord(evt)

    const distanceX = x - this.startX
    const distanceY = y - this.startY

    if (this.opts.captureBoth || (this.opts.captureX && Math.abs(distanceX) > 20) || (this.opts.captureY && Math.abs(distanceY) > 20)) {
      evt.preventDefault()
      evt.stopPropagation()
    }

    if (distanceX === this.distanceX && distanceY === this.distanceY) {
      return
    }

    this.towardLeft = distanceX < this.distanceX
    this.towardTop = distanceY < this.distanceY
    this.distanceX = distanceX
    this.distanceY = distanceY
    this.changed = true

    this.opts.onSwipe({
      x: distanceX,
      y: distanceY
    })
  }

  onSwipeEnd (evt) {
    if (!this.started) {
      return
    }

    if (this.opts.desktop) {
      document.removeEventListener('mousemove', this.onSwipe)
      document.removeEventListener('mouseup', this.onSwipeEnd)
    }

    if (this.opts.mobile) {
      document.removeEventListener('touchmove', this.onSwipe)
      document.removeEventListener('touchend', this.onSwipeEnd)
    }

    // To distinguish with the click event
    if (this.changed) {
      this.opts.onSwipeEnded({
        towardLeft: this.towardLeft,
        towardTop: this.towardTop,
        x: this.distanceX,
        y: this.distanceY
      })

      document.addEventListener('click', this.captureClick, { capture: true })
      setTimeout(() => {
        document.removeEventListener('click', this.captureClick, { capture: true })
      })
    }

    this.started = this.changed = false
  }

  captureClick (evt) {
    evt.stopPropagation()
  }
}

// Accept either a boolean or a handler function or an options object
function parseOptions (bindingValue, context) {
  const opts = typeof bindingValue === 'function'
    ? { onSwipe: bindingValue }
    : typeof bindingValue === 'boolean'
      ? { disabled: !bindingValue }
      : { ...bindingValue }

  for (const key of Object.keys(opts)) {
    if (typeof opts[key] === 'function') {
      opts[key] = opts[key].bind(context)
    }
  }

  return Object.assign({}, defaultOptions, opts)
}

function getCoord (evt) {
  const { clientX: x, clientY: y } = evt.touches?.[0] || evt
  return { x, y }
}
