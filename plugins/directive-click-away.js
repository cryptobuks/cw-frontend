import Vue from 'vue'

Vue.directive('click-away', {
  bind (el, binding, vnode) {
    // In mobile, if the binding element is created by a click/touch event
    // this bind method would run too fast, before the click/touch event bubble
    // up to document causing el.handleOutsideClick to run right away and result
    // in weird behavior
    // By setTimeout, init is pushed to the end of the event queue and would only
    // run after the click event bubble up to document and fix this issue.
    setTimeout(() => init(el, binding.value, vnode.context))
  },

  componentUpdated (el, binding, vnode) {
    if (binding.value !== binding.oldValue) {
      destroy(el)

      init(el, binding.value, vnode.context)
    }
  },

  unbind (el) {
    destroy(el)
  }
})

function init (el, handler, vnodeContext) {
  if (typeof handler !== 'function') {
    return
  }

  el.handleOutsideClick = (e) => {
    e.stopPropagation()

    if (!el.contains(e.target)) {
      handler.call(vnodeContext, e)
    }
  }

  document.addEventListener('click', el.handleOutsideClick)
  document.addEventListener('touchend', el.handleOutsideClick)
}

function destroy (el) {
  document.removeEventListener('click', el.handleOutsideClick)
  document.removeEventListener('touchend', el.handleOutsideClick)
}
