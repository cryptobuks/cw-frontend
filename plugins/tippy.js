import Vue from 'vue'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'

tippy.setDefaultProps({
  theme: 'light',
  trigger: 'mouseenter',
  appendTo: document.body,
  allowHTML: true
})

const tippyEvents = ['onShow', 'onShown', 'onHidden', 'onHide', 'onMount']

Vue.directive('tippy', {
  inserted (el, binding, vnode) {
    const props = parseBindingValue(binding.value)
    if (props) {
      createTippy(el, vnode, props)
    }
  },

  componentUpdated (el, binding, vnode) {
    if (binding.value === binding.oldValue) {
      return
    }

    const props = parseBindingValue(binding.value)

    if (!props) {
      destroy(el)
    } else if (!el._tippy) {
      createTippy(el, vnode, props)
    } else {
      updateTippy(el, props)
    }
  },

  unbind (el) {
    destroy(el)
  }
})

// Instantiate tippy and add a tippy instance to the element under the name _tippy
function createTippy (el, vnode, props) {
  if (!props.content) {
    props.content = extractContentFromEl(el)
  }

  if (!props.content) {
    return
  }

  const listeners = (vnode.data && vnode.data.on) || (vnode.componentOptions && vnode.componentOptions.listeners) || {}

  for (const event of tippyEvents) {
    // Strip the "on" prefix for component listeners
    const listenerName = event.replace('on', '').toLowerCase()
    if (listeners[listenerName]) {
      props[event] = function (...args) {
        return listeners[listenerName].fns(...args)
      }
    }
  }

  tippy(el, props)
}

function updateTippy (el, props) {
  if (!props.content) {
    props.content = extractContentFromEl(el)
  }

  if (!props.content) {
    return destroy(el)
  }

  el._tippy.setProps(props)
}

function destroy (el) {
  if (el._tippy) {
    el._tippy.destroy()
    delete el._tippy
  }
}

function extractContentFromEl (el) {
  const title = el.getAttribute('title')
  if (title) {
    el.removeAttribute('title')
    el.setAttribute('content', title)
  }

  return title || el.getAttribute('content') || ''
}

/**
 * Parse the v-tippy binding value, suppor 3 use cases:
 * @param {Boolean} bindingValue Enable or disable
 * @param {String} bindingValue Content
 * @param {Object} bindingValue Full tippy options
 */
function parseBindingValue (bindingValue) {
  const valueType = typeof bindingValue
  return valueType === 'boolean'
    ? bindingValue
      ? {}
      : false
    : valueType === 'string'
      ? { content: bindingValue }
      : bindingValue || {}
}
