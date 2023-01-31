<template>
  <transition-group name="base-fields" tag="div" class="base-fields">
    <progressive-field
      v-for="(field, i) in fieldsSortedByAreas"
      v-show="priorityMode || shouldShowAllFields || step >= field.index"
      :ref="field.name"
      :key="field.name"
      class="base-fields__field"
      :class="[
        !priorityMode && step === field.index ? 'is-pending' : '',
        i === gapIndex ? 'is-gap': '',
        field.class || ''
      ]"
      @transitionend.native.self="onTransitionEnd(field)"
    >
      <slot :name="field.name" :input-attrs="buildInputAttrs(field, i)" />
    </progressive-field>
  </transition-group>
</template>

<script>
import Vue from 'vue'
export default {
  components: {
    // Need to use component instead of raw div to take advantages of ref and ref.$children
    ProgressiveField: Vue.extend({
      render (h) {
        return h('div', this.$slots.default)
      }
    })
  },
  inheritAttrs: false,
  props: {
    // Fields definitions
    // [{ name: String, required: Boolean|[String], isEmpty: Function<Boolean>, [inputWrapperProp]: any, requiredMessage: String }]
    fields: { type: Array, default: () => [] },

    // Name of the fields to be excluded from fields
    hiddenFields: { type: Array, default: () => [] },

    // Name of the required fields
    requiredFields: { type: Array, default: () => [] },

    // Data object that holds all properties defined in fields
    data: { type: Object, default: () => ({}) },

    // A valid snapshot of the data object, is used to exclude valid fields's value from being validated
    validatedData: { type: Object, default: () => ({}) },

    showAllFields: Boolean,

    priorityMode: Boolean,

    priorityAreaSize: { type: Number, default: 3 }
  },
  data () {
    // For reactivity, without this even this.$set sometimes won't be enough
    const fieldsObj = {}
    this.fields.forEach(f => Object.assign(fieldsObj, { [f.name]: false }))

    return {
      // Last shown form field index
      step: 0,

      // [{ [field.name]: this.isEmpty(field) }]
      fieldsEmptyState: { ...fieldsObj },

      // [{ [field.name]: !!hasError }]
      fieldsErrorState: { ...fieldsObj },

      // [{ [field.name]: !!skipped }]
      fieldsSkipState: { ...fieldsObj },

      // Only when all required fields are filled and there is no fieldsErrorState
      canSave: false,

      focusedField: null,

      // fieldsSortedByAreas might changes up to many times a second making the UI shifting madly
      debounce: this.$utils.createDebounce(),

      fieldsSortedByAreas: [],
      gapIndex: -1,

      // When manually validate all fields, all fields become visble
      isValidateTriggered: false
    }
  },
  computed: {
    fieldsWithIndex () {
      const fields = []
      const rawFields = this.$utils.clone(this.fields)
      let index = 0

      for (const field of rawFields) {
        if (field.hidden || this.hiddenFields.includes(field.name)) {
          continue
        }

        if (this.requiredFields.includes(field.name)) {
          field.required = true
        } else {
          const requiredGroup = this.requiredFields.find(group => group?.fields?.includes?.(field.name))
          if (requiredGroup) {
            field.required = requiredGroup.fields
            field.requiredMessage = requiredGroup.message
          }
        }

        field.index = index++

        fields.push(field)
      }

      return fields
    },

    shouldShowAllFields () {
      return this.showAllFields || (this.isValidateTriggered && !this.priorityMode)
    },

    staticAttrs () {
      const output = {}

      this.fieldsWithIndex.forEach((field) => {
        const attrs = output[field.name] = {
          ...this.$utils.except(field, ['name', 'index', 'required', 'class', 'requiredMessage', 'isEmpty', 'default', 'hidden']),

          listeners: {
            error: () => this.updateFieldState(field, true),
            validated: () => this.updateFieldState(field, false),
            'validation-reset': () => this.$set(this.fieldsErrorState, field.name, false),
            focus: () => {
              this.focusedField = field
            },
            blur: () => {
              this.focusedField = null
              this.$emit('blur:' + field.name, field)
              this.$emit('field-blur', field)
            }
          }
        }

        if (!this.$utils.isEmpty(this.validatedData?.[field.name])) {
          attrs.validatedValue = this.validatedData[field.name]
        }

        if (Array.isArray(field.required)) {
          const requiredFields = field.required.map(name => this.fieldsWithIndex.find(f => f.name === name)).filter(Boolean)

          const required = () => requiredFields.some(f => !this.isEmpty(f)) || field.requiredMessage || this.$t('validation.required')

          if (requiredFields.includes(field)) {
            attrs.hiddenRules = { required }
          }

          this.extendMethod(attrs.listeners, 'focus', () => requiredFields.forEach((f) => {
            this.resetFieldValidation(f.name, 'required')
          }))

          this.extendMethod(attrs.listeners, 'blur', () => requiredFields.forEach((f) => {
            f.name !== field.name && this.validateField(f.name, 'required')
          }))
        } else if (field.required) {
          attrs.hiddenRules = {
            required: () => !this.isEmpty(field) || field.requiredMessage || this.$t('validation.required')
          }
        }
      })

      return output
    }
  },
  watch: {
    showAllFields: 'reset',
    priorityMode: 'reset',
    fieldsWithIndex: 'reset'
  },
  created () {
    const fieldsEmptyState = {}
    const fieldsSkipState = {}
    this.fields.forEach((field, i) => {
      fieldsEmptyState[field.name] = this.isEmpty(field)
      fieldsSkipState[field.name] = !fieldsEmptyState[field.name]
    })
    Object.assign(this.fieldsEmptyState, fieldsEmptyState)
    Object.assign(this.fieldsSkipState, fieldsSkipState)

    this.reset(0)
  },
  mounted () {
    // Auto scroll to focused input
    const body = this.findScrollableContainer(this.$el)
    body && this.$el.addEventListener('focusin', (evt) => {
      if (
        !this.shouldShowAllFields ||
        typeof evt?.target?.getBoundingClientRect !== 'function' ||
        typeof body?.getBoundingClientRect !== 'function' ||
        body.scrollTop >= body.scrollHeight - body.clientHeight
      ) {
        return
      }

      const offsetBottom = body.getBoundingClientRect().bottom - evt.target.getBoundingClientRect().bottom
      const half = body.clientHeight / 2
      if (offsetBottom < half) {
        body.scrollTop = body.scrollTop + half - offsetBottom
      }
    })
  },
  methods: {
    // Build an object that is meant to be passed to input components that are wrapped by InputWrapper
    // If there is no InputWrapper the target component must implement the same set of props as this method's output
    buildInputAttrs (field, i) {
      const staticAttrs = this.staticAttrs[field.name] || {}
      const gapIndex = this.gapIndex
      const attrs = {
        ...staticAttrs,
        listeners: {
          ...staticAttrs.listeners
        }
      }

      if (!this.shouldShowAllFields && this.priorityMode) {
        Object.assign(attrs, {
          active: i <= gapIndex,
          inactive: gapIndex !== -1 && i > gapIndex
        })

        if (!this.fieldsSkipState[field.name]) {
          attrs.tabindex = 1
        }
      }

      if (!this.shouldShowAllFields && !this.fieldsSkipState[field.name]) {
        // Have margin-top being a bit larger than usual field
        const pending = !this.priorityMode && this.step === field.index && this.step < this.fieldsWithIndex.length
        if (pending) {
          this.extendMethod(attrs.listeners, 'focus', () => this.nextStep())
        }

        // Should show skip icon
        const canSkip = (pending && !field.required) || (
          gapIndex >= i &&
          !this.fieldsErrorState[field.name] &&
          (
            !field.required ||
            (
              Array.isArray(field.required) &&
              field.required.some(fieldName => !this.fieldsEmptyState[fieldName] && !this.fieldsErrorState[fieldName])
            )
          )
        )

        if (canSkip) {
          this.extendMethod(attrs.listeners, 'skip', () => this.skipField(field, i, pending))
        }
      }

      if (attrs.tooltip === undefined) {
        attrs.tooltip = ref => ref.label
      }

      return attrs
    },

    async skipField (field, i, shouldChangeStep) {
      this.$set(this.fieldsSkipState, [field.name], true)

      shouldChangeStep && this.nextStep()

      await this.reset()

      const curField = this.fieldsSortedByAreas[this.shouldShowAllFields || this.priorityMode ? i : i + 1]
      if (curField) {
        const $field = this.$refs[curField.name][0]
        const [$input] = this.findDescendants($field, c => typeof c.focus === 'function', true)
        $input?.focus?.()
      }
    },

    nextStep () {
      if (this.step < this.fieldsWithIndex.length) {
        this.step++
      }
    },

    updateFieldState (field, hasError = false) {
      setTimeout(() => {
        const oldEmpty = this.fieldsEmptyState[field.name]
        const oldError = this.fieldsErrorState[field.name]

        this.$set(this.fieldsEmptyState, field.name, this.isEmpty(field))
        this.$set(this.fieldsErrorState, field.name, hasError)

        if (!this.fieldsEmptyState[field.name] && this.isCorrectlyFilled(field)) {
          this.$set(this.fieldsSkipState, field.name, true)

          this.reset()
        } else if (oldEmpty !== this.fieldsEmptyState[field.name] || oldError !== this.fieldsErrorState[field.name]) {
          this.updateCanSave()
        }
      })
    },

    reset (delay = 200) {
      return delay
        ? this.debounce(() => this.resetFieldsSortedByArea(), delay)
        : this.resetFieldsSortedByArea()
    },

    resetFieldsSortedByArea () {
      if (!this.shouldShowAllFields && this.priorityMode) {
        const priorityFields = []
        const requiredFields = []
        const optionalFields = []
        for (const field of this.fieldsWithIndex) {
          if (field.required) {
            requiredFields.push(field)
          } else {
            optionalFields.push(field)
          }
        }
        const fields = requiredFields.concat(optionalFields)
        const size = this.priorityAreaSize

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          const name = field.name
          if (this.fieldsSkipState[name]) {
            continue
          }

          if (this.fieldsErrorState[name] || this.fieldsEmptyState[name]) {
            priorityFields.push(field)
          }

          if (priorityFields.length === size) {
            break
          }
        }

        const { activeElement } = document
        let triggered = false
        const reFocus = () => setTimeout(() => {
          activeElement?.focus()
          triggered = true
        })
        activeElement?.addEventListener('blur', reFocus)
        this.fieldsSortedByAreas = Array.from(new Set(priorityFields.concat(this.fieldsWithIndex)))
        this.gapIndex = priorityFields.length - 1
        setTimeout(() => {
          activeElement?.removeEventListener('blur', reFocus)
          triggered && this.focusedField && this.onTransitionEnd(this.focusedField)
        })
      } else {
        this.fieldsSortedByAreas = [...this.fieldsWithIndex]
        this.gapIndex = -1
      }

      this.updateCanSave()
    },

    updateCanSave (hasError = false) {
      if (this.$listeners['can-save-change']) {
        const newCanSave = !hasError && !this.fieldsWithIndex.some(f => !this.isCorrectlyFilled(f))
        if (newCanSave !== this.canSave) {
          this.canSave = newCanSave
          this.$emit('can-save-change', this.canSave)
        }
      }
    },

    async forceUpdate (fieldNames, opts = {}) {
      const fields = fieldNames
        ? [].concat(fieldNames).map(fieldName => this.fieldsWithIndex.find(f => f.name === fieldName)).filter(Boolean)
        : this.fieldsWithIndex

      const fieldsEmptyState = fields.reduce((state, f) => Object.assign(state, { [f.name]: this.isEmpty(f) }), {})

      Object.assign(this.fieldsEmptyState, fieldsEmptyState)

      if (opts.resetValidation) {
        const resetedFields = opts.resetValidation === true ? fields : Array.isArray(opts.resetValidation) ? fields.filter(f => opts.resetValidation.includes(f.name)) : []
        resetedFields.forEach(f => this.resetFieldValidation(f.name))
      }

      if (opts.validate) {
        const validatedFields = typeof opts.validate === 'boolean' ? fields : fields.filter(f => f.opts.validate.includes(f.name))
        for (const field of validatedFields) {
          if (this.isCorrectlyFilled(field, fieldsEmptyState) || this.fieldsErrorState[field.name]) {
            await this.validateField(field.name)
          }
        }
      }

      this.reset()
    },

    isCorrectlyFilled (field, emptyState) {
      const fieldsEmptyState = emptyState || this.fieldsEmptyState
      return !this.fieldsErrorState[field.name] &&
        !(field.required === true && fieldsEmptyState[field.name]) &&
        !(Array.isArray(field.required) && field.required.every(name => fieldsEmptyState[name] || this.fieldsErrorState[name]))
    },

    // Update poppover position after finish transitioning
    onTransitionEnd (field) {
      const $field = this.$refs[field.name][0]
      if ($field && $field.$el.contains(document.activeElement)) {
        const $popovers = this.findDescendants($field, c => !!c.popper)
        $popovers.forEach($popover => $popover.popper.update())
      }
    },

    async validate () {
      this.isValidateTriggered = true
      await new Promise(resolve => this.$nextTick(() => resolve()))
      let allPassed = true
      for (const field of this.fieldsWithIndex) {
        if (!(await this.validateField(field.name, null, allPassed))) {
          allPassed = false
        }
      }
      return allPassed
    },

    async validateField (fieldName, rules, focusOnError = false) {
      const [$field] = this.$refs[fieldName] || []
      if ($field) {
        const inputs = this.findDescendants($field, c => typeof c.validate === 'function' && c.$el)
        const res = inputs.length && (await Promise.all(inputs.map(input => input.validate(rules)))).every(Boolean)
        if (focusOnError && inputs[0] && !res) {
          if (typeof inputs[0].focus === 'function') {
            inputs[0].focus()
          } else {
            const scroll = inputs[0].$el?.scrollIntoView
            typeof scroll === 'function' && scroll()
          }
        }
        return !inputs[0] || !!res
      }
      return true
    },

    resetFieldValidation (fieldName, ruleName) {
      const [$field] = this.$refs[fieldName] || []
      if ($field) {
        const inputs = this.findDescendants($field, c => typeof c.resetValidation === 'function')
        return inputs.map(input => input.resetValidation(ruleName))
      }
    },

    findDescendants ($parent, check, firstChildOnly = false, childs = []) {
      if (!$parent || !$parent.$children) {
        return childs
      }

      for (const child of $parent.$children || []) {
        if (check(child)) {
          childs.push(child)

          if (firstChildOnly) {
            break
          }
        } else {
          this.findDescendants(child, check, firstChildOnly, childs)
        }
      }

      return childs
    },

    isEmpty (field) {
      const val = this.data[field.name]
      return field.isEmpty
        ? field.isEmpty(val)
        : this.$utils.isEmpty(val)
    },

    extendMethod (obj, methodName, extend) {
      const originalMethod = obj[methodName]
      obj[methodName] = (...params) => {
        typeof originalMethod === 'function' && originalMethod(...params)

        extend(...params)
      }
    },

    findScrollableContainer (parentEl) {
      return parentEl instanceof Element
        ? parentEl.classList.contains('base-scroll')
          ? parentEl
          : this.findScrollableContainer(parentEl.parentNode)
        : document.documentElement
    }
  }
}
</script>

<style lang="scss">
.base-fields {
  &-move {
    transition: transform .3s !important;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
    transition: none;
    transform: none !important;
  }

  &__field {
    &:not(:first-child).is-pending {
      margin-top: 30px;
    }

    &.is-gap {
      padding-bottom: 22vh;
    }
  }

  &__skip {
    display: none;
  }
}
</style>
