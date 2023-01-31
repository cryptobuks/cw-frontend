import Vue from 'vue'
import ConfirmPopup from '~/components/global/ConfirmPopup'

export default function (ctx, inject) {
  let mountedComponent = null

  const Component = Vue.extend({
    data () {
      return {
        active: false,
        opts: { ...this.defaultOpts },
        promise: null,
        callback: null
      }
    },

    computed: {
      defaultOpts () {
        const $t = key => ctx.app.i18n.t(key)
        return {
          title: $t('confirm.default_title'),
          dismissible: true,
          text: $t('confirm.default_text'),
          html: null,
          yesText: $t('global.yes'),
          noText: $t('global.no'),
          actions: [],
          overlay: false,
          fullWidthActions: false
        }
      }
    },

    methods: {
      show (opts, cb) {
        const parsedOpts = typeof opts === 'string'
          ? { text: opts }
          : opts

        Object.assign(this.opts, this.defaultOpts, parsedOpts)

        this.callback = typeof cb === 'function' ? cb : null
        this.active = true

        // Only return a promise when use the default actions (Yes and No)
        // Otherwise let the action handler take cares of the job
        if (!this.callback && !this.opts.actions.length) {
          return new Promise((resolve, reject) => {
            this.promise = { resolve, reject }
          })
        }
      },

      done (yes = false) {
        if (this.promise) {
          if (yes) {
            this.promise.resolve()
          } else {
            this.promise.reject()
          }
        } else if (this.callback && yes) {
          this.callback()
        }
      },

      onActiveChange (active) {
        this.active = !!active
        if (!this.active) {
          if (this.promise) {
            this.promise.reject()
          }

          this.reset()
        }
      },

      reset () {
        this.opts = { ...this.defaultOpts }
        this.active = false
        this.promise = this.callback = null
      }
    },

    render (h) {
      return h(ConfirmPopup, {
        props: {
          ...this.opts,
          active: this.active
        },
        on: {
          yes: () => this.done(true),
          no: () => this.done(false),
          'active-change': active => this.onActiveChange(active),
          'action-click': (shouldClose) => {
            if (shouldClose) {
              this.active = false
            }
          }
        }
      })
    }
  })

  /**
   * Mount and show the confirm popup
   *
   * @param {Object} opts Refer to defaultOpts properties
   *
   * @param {Function} cb
   *
   * @returns
   * If cb is a function, cb will be called once button Yes is clicked
   * Else if opts.actions is empty, which mean default Yes and No buttons are used, return a promise
   * Else trigger action.handler on click event of that action's corresponding button
   */
  inject('confirm', (opts, cb) => {
    if (!mountedComponent) {
      mountedComponent = new Component().$mount()
      document.body.appendChild(mountedComponent.$el)
    }

    return mountedComponent.show(opts, cb)
  })
}
