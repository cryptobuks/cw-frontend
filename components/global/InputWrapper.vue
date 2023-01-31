<template>
  <div
    class="base-input__wrapper mb-4"
    :class="{
      disabled: inputAttrs.disabled,
      readonly: inputAttrs.readonly,
      'has-value': hasValue,
      'has-prepend': !hidePrepend,
      'has-append': !!$scopedSlots.append,
      'is-date': inputAttrs.type === 'date',
      active,
      inactive,
      naked,
      light,
      sm
    }"
  >
    <slot name="before" />

    <div v-if="!hidePrepend" class="base-input__prepend">
      <slot name="prepend" />

      <base-icon
        v-if="computedTooltip"
        v-tippy="
          inputAttrs.disabled
            ? false
            : {
              content: computedTooltip,
              placement: 'bottom',
            }
        "
        tabindex="-1"
        name="question-circle"
        class="base-input__tooltip"
      />

      <base-icon v-else name="circle" />
    </div>

    <div class="base-input__body">
      <div
        v-if="prependIcon || $scopedSlots['prepend-icon']"
        class="base-input__prepend-icon"
        @click.stop="execListener('prepend-icon')"
      >
        <slot name="prepend-icon">
          <base-icon :name="prependIcon" :size="iconSize" />
        </slot>
      </div>

      <div class="base-input__input" :class="{ 'has-error': hasError }">
        <slot
          :input-attrs="inputAttrs"
          :input-listeners="inputListeners"
          :input-class="inputClass"
        />
      </div>

      <div v-if="$slots.affix || affix" class="base-input__affix">
        <slot name="affix">
          {{ affix }}
        </slot>
      </div>

      <div
        v-if="
          !inputAttrs.disabled &&
            !inputAttrs.readonly &&
            clearable &&
            hasValue
        "
        key="input-clear"
        class="base-input__append-icon"
        @click.stop="clear"
      >
        <base-icon name="time-circle" />
      </div>

      <div
        v-if="appendIcon || $scopedSlots['append-icon']"
        key="input-append"
        class="base-input__append-icon"
        @click.stop="execListener('append-icon')"
      >
        <slot name="append-icon">
          <base-icon :name="appendIcon" :size="iconSize" />
        </slot>
      </div>

      <div
        v-if="isSkippable"
        key="input-skip"
        class="base-input__append-icon base-input__skip-icon"
        @click.stop="execListener('skip')"
      >
        <slot name="append-icon">
          <base-icon name="skip" :size="20" />
        </slot>
      </div>
    </div>

    <div v-if="!!$scopedSlots.append" class="base-input__append">
      <slot name="append" />
    </div>

    <div v-if="!naked" class="base-input__label">
      <div v-if="label" class="base-input__label__inner">
        {{ label }}
      </div>
    </div>

    <base-validation-error
      ref="error"
      :value="validationValue === undefined ? tempValue : validationValue"
      :validated-value="validatedValue"
      :rules="rules"
      :hidden-rules="hiddenRules"
      :hide-error="hideError"
      class="base-input__error"
      v-on="errorListeners"
    >
      <template
        v-for="name in filterErrorSlots($scopedSlots)"
        v-slot:[name]="props"
      >
        <slot :name="name" v-bind="props" />
      </template>
    </base-validation-error>

    <slot name="after" />
  </div>
</template>

<script>
export default {
  name: 'BaseInputWrapper',
  inheritAttrs: false,
  props: {
    label: { type: String, default: '' },

    // eslint-disable-next-line vue/require-prop-types
    value: { default: null },

    rules: { type: [Array, Object], default: () => [] },

    hiddenRules: { type: [Array, Object], default: () => [] },

    // For checkbox and radio, event should be 'change'
    event: { type: String, default: 'input' },

    // Same as $listeners but use as a prop
    listeners: { type: Object, default: () => ({}) },

    tooltip: { type: [String, Function], default: '' },

    inputClass: { type: String, default: '' },

    appendIcon: { type: String, default: null },

    prependIcon: { type: String, default: null },

    clearable: { type: Boolean, default: true },

    iconSize: { type: Number, default: 20 },

    affix: { type: String, default: '' },

    hidePrepend: Boolean,

    // Hide label, border bottom and veritically center align the tooltip
    naked: Boolean,

    // No opacity
    active: Boolean,

    // Always with opacity
    inactive: Boolean,

    // Used on white background
    light: Boolean,

    // Small
    sm: Boolean,

    noValidateOnBlur: Boolean,

    // eslint-disable-next-line vue/require-prop-types
    validationValue: { default: undefined },

    // eslint-disable-next-line vue/require-prop-types
    validatedValue: { default: undefined },

    hideError: Boolean
  },
  data: () => ({
    tempValue: null,
    hasError: false
  }),
  computed: {
    computedTooltip () {
      const tooltip =
        typeof this.tooltip === 'function' ? this.tooltip(this) : this.tooltip

      return tooltip
    },

    isChrome () {
      return (
        navigator.userAgent.includes('Chrome') &&
        navigator.vendor.includes('Google Inc')
      )
    },

    inputAttrs () {
      const {
        type,
        autocomplete,
        disabled,
        readonly,
        placeholder,
        ...attrs
      } = this.$attrs
      return Object.assign(attrs, {
        type,
        placeholder: placeholder || this.label,
        autocomplete:
          autocomplete ||
          (type === 'password'
            ? 'new-password'
            : this.isChrome
              ? 'chrome-off'
              : 'off'),
        value: this.tempValue,
        disabled: !!disabled || disabled === '',
        readonly: !!readonly || readonly === ''
      })
    },

    isSkippable () {
      return !!this.mergedListeners.skip
    },

    // Merge native $listeners with prop listeners
    mergedListeners () {
      const listeners = { ...this.$listeners }
      for (const key of Object.keys(this.listeners)) {
        if (typeof this.listeners[key] !== 'function') {
          continue
        }

        listeners[key] = !listeners[key]
          ? this.listeners[key]
          : (...params) => {
            this.$listeners[key](...params)
            this.listeners[key](...params)
          }
      }

      return listeners
    },

    inputListeners () {
      const { blur, ...listeners } = this.mergedListeners

      listeners.blur = (evt) => {
        // IMPORTANT: Always validate before execute blur handler
        if (!this.noValidateOnBlur) {
          this.validate()
        }

        blur && blur(evt)
      }

      if (this.event) {
        listeners[this.event] = ($event) => {
          this.setValue($event instanceof Event ? $event.target.value : $event)
        }
      }

      if (this.clearable) {
        // On ESC keyup
        listeners.keyup = (evt) => {
          if (evt.keyCode === 27) {
            evt.preventDefault()
            evt.stopPropagation()

            this.clear()
          }
        }
      }

      return listeners
    },

    errorListeners () {
      const {
        'validation-reset': reset,
        error,
        validated,
        ...listeners
      } = this.mergedListeners

      const output = {
        reset: () => {
          this.hasError = false
          reset && reset()
        },

        error: (...params) => {
          this.hasError = true
          error && error(...params)
        },

        validated: () => {
          this.hasError = false
          validated && validated()
        }
      }

      for (const key of Object.keys(listeners)) {
        if (key.startsWith('error:')) {
          output[key] = listeners[key]
        }
      }

      return output
    },

    hasValue () {
      return Array.isArray(this.tempValue)
        ? this.tempValue.length > 0
        : !!this.tempValue ||
            typeof this.tempValue === 'boolean' ||
            typeof this.tempValue === 'number'
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (value) {
        this.tempValue = value
      }
    }
  },
  mounted () {
    const propagatedMethods = [
      'validate',
      'resetValidation',
      'clear',
      'setValue'
    ]
    for (const method of propagatedMethods) {
      if (!this.$parent[method]) {
        this.$parent[method] = (...params) => this[method](...params)
      }
    }

    if (this.$attrs.autofocus && typeof this.$parent.focus === 'function') {
      this.$parent.focus()
    }
  },
  methods: {
    setValue (value) {
      this.tempValue = value

      if (this.mergedListeners[this.event]) {
        this.mergedListeners[this.event](value)
      }
    },

    execListener (lisName, e) {
      const listener = this.mergedListeners[lisName]
      typeof listener === 'function' && listener(e)
    },

    clear () {
      if (typeof this.$parent.focus === 'function') {
        this.$parent.focus()
      }
      this.setValue(null)
      this.$emit('clear')
    },

    validate (rules) {
      return this.$refs.error && this.$refs.error.validate(rules)
    },

    resetValidation (ruleName) {
      this.$refs.error && this.$refs.error.resetValidation(ruleName)
    },

    filterErrorSlots (slots) {
      return Object.keys(slots).filter(s => s.startsWith('error'))
    }
  }
}
</script>

<style lang="scss">
.base-input {
  &__wrapper {
    --color: #fff;
    --opacity: 0.5;

    color: var(--color);
    width: 100%;
    font-size: 20px;

    .base-icon {
      font-size: 20px;
    }

    &.sm {
      font-size: 16px;

      .base-icon {
        font-size: 16px;
      }

      .base-input {
        &__prepend {
          padding-right: 4px;
        }

        &__input {
          input,
          textarea,
          select {
            font-size: 16px;
            padding: 4px 3px 4px 4px;
            min-height: 36px;
          }
        }

        &__label {
          &:before {
            min-width: 8px;
          }

          &:after {
            width: 8px;
          }

          &__inner {
            font-size: 10px;
            padding: 0 3px;
          }
        }

        &__error {
          font-size: 12px;
        }
      }
    }

    &.has-append {
      display: grid;
      grid-template-columns: 1fr min-content;

      & > .base-input__append {
        grid-column: 2;
      }
    }

    // TODO Completely remove has-prepend after all bugs are fixed
    &.has-prepend {
      display: grid;
      grid-template-columns: min-content 1fr;

      &.has-append {
        grid-template-columns: min-content 1fr min-content;

        & > .base-input {
          &__append {
            grid-column: 3;
          }
        }
      }

      & > .base-input {
        &__body,
        &__label,
        &__error {
          grid-column: 2;
        }
      }
    }

    &.has-prepend .base-input__wrapper,
    &.naked {
      display: block;

      .base-input__prepend {
        display: none;
      }
    }

    &.naked {
      & > .base-input {
        &__prepend,
        &__append {
          align-items: center;
          align-self: center;
          margin-bottom: 0;
        }

        &__body {
          height: 100%;
        }
      }
    }

    &.has-value,
    &.is-date {
      & > .base-input__label > .base-input__label__inner {
        display: inline-block;
      }
    }

    &.has-value {
      --opacity: 1;

      .base-input__skip-icon {
        @apply hidden;
      }
    }

    &.light {
      &,
      .base-input__wrapper {
        --color: #262626;
      }
    }

    &.readonly,
    &.disabled {
      --opacity: 0.75;
    }

    &.active {
      --opacity: 1;

      .base-input__input {
        textarea::placeholder,
        input::placeholder {
          opacity: 0.5;
        }
      }
    }

    &.inactive {
      --opacity: 0.5;
    }

    .base-input__wrapper {
      --opacity: 1 !important;
    }
  }

  &__prepend,
  &__append {
    opacity: var(--opacity);
    align-self: end;
    margin: 0 -5px -10px;
    display: flex;
    align-items: flex-end;
    font-size: 15px;

    > * {
      margin: 0 5px;
    }
  }

  &__prepend {
    padding-right: 10px;
  }

  &__append {
    align-self: end;
    padding-left: 10px;
  }

  &__affix {
    opacity: var(--opacity);
    align-self: center;
    margin-right: 5px;
  }

  &__tooltip {
    &:focus {
      outline: none;
    }
  }

  &__body {
    align-self: end;
    flex-grow: 1;
    display: flex;
    width: 100%;

    &:focus-within {
      & > .base-input__input {
        color: var(--color);

        textarea::placeholder,
        input::placeholder {
          opacity: 0;
        }
      }

      & ~ .base-input__label .base-input__label__inner {
        display: inline-block;
      }

      & ~ .base-input__error {
        opacity: 0;
      }

      .base-input__skip-icon {
        @apply hidden;
      }
    }
  }

  &__input {
    flex-grow: 1;
    width: 100%;
    position: relative;

    &.has-error {
      @apply text-cw-red;
    }

    input,
    select,
    textarea {
      opacity: var(--opacity);
      min-height: 42px;
      width: 100%;
      background: transparent;
      border: none;
      box-shadow: none;
      outline: none;
      padding: 6px 5px 6px 7px;
      font-size: 20px;
      line-height: 1.5;
      letter-spacing: -0.44px;
      color: inherit;
      resize: none;
    }

    textarea::placeholder,
    input::placeholder {
      text-transform: initial;
      color: var(--color);
    }
  }

  &__prepend-icon,
  &__append-icon {
    opacity: var(--opacity);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    align-self: center;
    transition: ease-in-out 0.3s;
    cursor: pointer;

    img {
      width: 20px;
      object-fit: cover;
    }
  }

  &__append-icon {
    + .base-input__append-icon {
      margin-left: 6px;
    }
  }

  &__label {
    opacity: var(--opacity);
    display: flex;
    align-items: center;
    height: 20px;
    margin-top: -10px;
    pointer-events: none;
    z-index: 1;

    &:before,
    &:after {
      content: "";
      display: block;
      height: 1px;
      background-color: var(--color);
      flex-shrink: 0;
    }

    &:before {
      min-width: 18px;
      flex-grow: 1;
    }

    &:after {
      width: 18px;
    }

    &__inner {
      flex-shrink: 0;
      display: none;
      font-size: 13px;
      font-weight: 500;
      line-height: 1;
      letter-spacing: -0.29px;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 10px;
    }
  }

  &__error {
    grid-column: 1 / 3;
    font-size: 15px;
    margin-bottom: -1em;
    @apply text-cw-red text-center leading-none;
  }
}
</style>
