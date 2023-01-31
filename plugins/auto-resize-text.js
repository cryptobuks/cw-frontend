import Vue from 'vue'
import tippy from 'tippy.js'
import { createDebounce } from './utils'

Vue.directive('auto-resize-text', {
  inserted (el, binding) {
    const fontSize = parseFloat(window.getComputedStyle(el, null).getPropertyValue('font-size'))
    const debounceUpdate = createDebounce(() => update(el), 250)

    el._autoResizer = {
      initialFontSize: fontSize,
      fontSize,
      opts: binding.value,
      isInput: el.tagName && el.tagName.toLowerCase() === 'input',
      update: debounceUpdate
    }

    Object.assign(el.style, {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    })

    el._autoResizer.resizeObserver = new ResizeObserver(() => debounceUpdate())
    el._autoResizer.resizeObserver.observe(el)

    debounceUpdate()

    if (el._autoResizer.isInput) {
      el.addEventListener('focus', () => destroyTooltip(el))
      el.addEventListener('blur', () => {
        if (!el._tippy && el.scrollWidth > el.offsetWidth) {
          el.lastTextContent = el.value || el.placeholder
          setTooltip(el, el.lastTextContent)
        }
      })
    }
  },

  componentUpdated (el, binding) {
    el._autoResizer.opts = binding.value
    el._autoResizer.update()
  },

  unbind (el) {
    destroyTooltip(el)
    el._autoResizer.resizeObserver.disconnect()
  }
})

function update (el) {
  if (!el.clientWidth) {
    return destroyTooltip(el)
  }

  const bindingValue = el._autoResizer.opts
  if (!bindingValue && typeof bindingValue === 'boolean') {
    el._autoResizer.fontSize = el._autoResizer.initialFontSize
    el.style.fontSize = ''
    return destroyTooltip(el)
  }

  const textContent = el.textContent || el.value || el.placeholder || ''
  if (textContent === el._autoResizer.lastTextContent && el.clientWidth === el._autoResizer.lastWidth) {
    return
  }

  el._autoResizer.lastTextContent = textContent
  el._autoResizer.lastWidth = el.clientWidth

  if (
    el._autoResizer.fontSize === el._autoResizer.initialFontSize &&
    el.scrollWidth <= el.clientWidth &&
    (!el._autoResizer.isInput || el.value || !el.placeholder)
  ) {
    return destroyTooltip(el)
  }

  const { tooltipOnly = false, min, max } = bindingValue || {}

  if (!tooltipOnly) {
    const maxFontSize = max || el._autoResizer.initialFontSize
    const minFontSize = min || Math.max(10, maxFontSize - 6)
    const newFontSize = getOptimalFontSize(el, minFontSize, maxFontSize)
    if (newFontSize) {
      el._autoResizer.fontSize = newFontSize
      el.style.fontSize = el._autoResizer.initialFontSize === newFontSize ? '' : newFontSize + 'px'
    }
  }

  if (el.scrollWidth > el.clientWidth && (!el._autoResizer.isInput || el !== document.activeElement)) {
    setTooltip(el, textContent)
  } else {
    destroyTooltip(el)
  }
}

function getOptimalFontSize (el, min, max) {
  if (min >= max) {
    return max
  }

  const styles = window.getComputedStyle(el, null)
  const span = document.createElement('span')
  span.textContent = el._autoResizer.lastTextContent
  span.timestamp = el._autoResizer.timestamp = Date.now()
  span.fontSize = parseFloat(styles.getPropertyValue('font-size'))
  Object.assign(span.style, {
    whiteSpace: 'nowrap',
    position: 'relative',
    opacity: '0',
    left: '200vw',
    transition: 'none',
    fontSize: span.fontSize + 'px',
    fontFamily: styles.getPropertyValue('font-family'),
    fontWeight: styles.getPropertyValue('font-weight'),
    letterSpacing: styles.getPropertyValue('letter-spacing') + 'px'
  })

  document.body.appendChild(span)

  const cssWidth = el.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingLeft)
  const fontSize = calculateFontSize(span, cssWidth, min, max, el._autoResizer)

  document.body.removeChild(span)

  return fontSize && Math.round(fontSize * 10) / 10
}

function calculateFontSize (el, targetWidth, minFontSize, maxFontSize, opts) {
  if (el.timestamp !== opts.timestamp) {
    return
  }

  if (el.fontSize > maxFontSize) {
    return maxFontSize
  } else if (el.fontSize < minFontSize) {
    return minFontSize
  }

  const [min, max] = el.offsetWidth >= targetWidth
    ? [minFontSize, el.fontSize]
    : [el.fontSize, maxFontSize]

  const newFontSize = Math.round((min + max) * 50) / 100
  if (newFontSize === el.fontSize) {
    return newFontSize
  } else {
    el.fontSize = newFontSize
    el.style.fontSize = el.fontSize + 'px'

    return calculateFontSize(el, targetWidth, min, max, opts)
  }
}

function setTooltip (el, content) {
  const props = { content }
  if (el._tippy) {
    el._tippy.setProps(props)
  } else {
    tippy(el, props)
  }
}

function destroyTooltip (el) {
  if (el._tippy) {
    el._tippy.destroy()
    delete el._tippy
  }
}
