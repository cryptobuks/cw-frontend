<template>
  <div
    class="base-checkbox"
    :class="{
      'opacity-50': !tmp && !isIndeterminate,
      active,
      inactive,
      indeterminate: isIndeterminate,
      'is-square': square,
      'is-light': light,
      'is-sm': sm
    }"
  >
    <input
      :checked="tmp"
      :type="$attrs.type || 'checkbox'"
      v-bind="value !== undefined ? { ...$attrs, value } : $attrs"
      class="base-checkbox__input"
      v-on="$utils.except($listeners, 'change')"
      @change="toggle"
    >

    <slot name="input">
      <span class="base-checkbox__check" />
    </slot>

    <div
      v-if="label || $slots.default"
      class="base-checkbox__label"
      :class="{ 'cursor-pointer': !disableLabel }"
      @click="!disableLabel && toggle()"
    >
      <slot>
        {{ label }}
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: { type: [Array, Boolean], default: false },
    // value must be array in case of indeterminate
    value: { type: [String, Number, Array], default: undefined },
    label: { type: String, default: '' },
    indeterminate: Boolean,
    square: Boolean,
    light: Boolean,
    sm: Boolean,
    disableLabel: Boolean,
    active: Boolean,
    inactive: Boolean
  },
  computed: {
    isArrayValue () {
      return Array.isArray(this.checked)
    },
    isIndeterminate () {
      return this.indeterminate ||
        (
          this.isArrayValue &&
          Array.isArray(this.value) &&
          this.value.some(v => this.checked.includes(v)) &&
          this.value.some(v => !this.checked.includes(v))
        )
    },
    tmp: {
      get () {
        return this.isArrayValue
          ? Array.isArray(this.value)
            ? this.value.every(c => this.checked.includes(c))
            : this.checked.includes(this.value)
          : this.checked
      },
      set (v) {
        if (!this.isArrayValue) {
          this.setChecked(v)
        } else if (Array.isArray(this.value)) {
          const len = this.checked.filter(c => this.value.includes(c)).length
          if (len < this.value.length) {
            this.setChecked(Array.from(new Set(this.checked.concat(this.value))))
          } else {
            this.setChecked(this.checked.filter(c => !this.value.includes(c)))
          }
        } else {
          const checked = this.checked.slice()
          const i = checked.indexOf(this.value)
          if (i === -1) {
            checked.push(this.value)
          } else {
            checked.splice(i, 1)
          }
          this.setChecked(checked)
        }
      }
    }
  },
  methods: {
    toggle () {
      this.tmp = this.isArrayValue ? this.value : !this.tmp
    },

    setChecked (checked) {
      this.$emit('change', checked)
    }
  }
}
</script>

<style lang="scss">
.base-checkbox {
  border-color: #fafafa;
  @apply relative flex items-center select-none;

  &:focus {
    @apply outline-none;
  }

  &.is-light {
    border-color: #0a0a0a;
  }

  &.is-square {
    &.indeterminate .base-checkbox__check {
      &:before {
        @apply bg-white rounded-none;
      }
    }

    .base-checkbox__check {
      @apply rounded-3px;

      &:after {
        border-color: inherit;
      }
    }

    .base-checkbox__input:checked ~ .base-checkbox__check {
      border-color: inherit;
      background-color: transparent;
    }
  }

  &.is-sm {
    .base-checkbox {
      &__input, &__check {
        width: 15px;
        height: 15px;
      }

      &__check {
        &:after {
          width: 5px;
          height: 9px;
        }
      }
    }
  }

  &.inactive {
    @apply opacity-50;
  }

  &.active {
    @apply opacity-100;

    .base-checkbox__input:disabled ~ .base-checkbox {
      &__check,
      &__label {
        @apply opacity-50 cursor-default ml-3;
      }
    }
  }

  &.indeterminate {
    .base-checkbox__check {
      @apply relative;

      &:after {
        @apply hidden;
      }

      &:before {
        content: "";
        top: 4px;
        bottom: 4px;
        right: 4px;
        left: 4px;
        background-color: #86cf9e;
        @apply absolute block rounded-full;
      }
    }
  }

  &__input {
    width: 22px;
    height: 22px;
    z-index: 1;
    @apply absolute opacity-0 cursor-pointer;

    &:checked ~ .base-checkbox__check {
      border-color: #86cf9e;
      background-color: #86cf9e;

      &:after {
        @apply block;
      }
    }
  }

  &__check {
    height: 22px;
    width: 22px;
    border-color: inherit;
    @apply inline-flex justify-center items-center flex-shrink-0 bg-transparent border-2 border-solid rounded-full cursor-pointer;

    &:after {
      content: "";
      width: 7px;
      height: 12px;
      top: -1px;
      border-width: 0 2px 2px 0;
      @apply hidden relative border-solid border-white transform rotate-45;
    }
  }

  &__label {
    @apply ml-3;
  }
}
</style>
