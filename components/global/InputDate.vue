<template>
  <base-input-wrapper
    class="base-date"
    v-bind="$attrs"
    :value="value"
    type="date"
    placeholder="mm/dd/yyyy"
    v-on="$listeners"
  >
    <template #default="{ inputAttrs, inputListeners, inputClass }">
      <base-popover
        ref="popover"
        show-on-focus
        :disabled="$mq === 'mobile' || inputAttrs.readonly || inputAttrs.disabled"
        class="base-date__popover"
      >
        <template #activator>
          <input
            ref="input"
            :class="[
              inputClass,
              tmpValue ? '' : 'empty',
              $mq === 'mobile' ? 'is-mobile' : ''
            ]"
            v-bind="{
              ...inputAttrs,
              ...dateInputAttrs,
              value: valueString
            }"
            v-on="{
              ...inputListeners,
              input: (e) => setValue(e.target.value)
            }"
            @focus="onFocus"
            @click="$mq !== 'mobile' ? $event.preventDefault() : null"
          >
        </template>

        <date-picker
          :value="tmpValue"
          :lang="languages[language] || languages.en"
          v-bind="datePickerOpts"
          calendar-class="base-date__picker"
          full-month-name
          inline
          @input="setValue($event, true)"
        />
      </base-popover>
    </template>

    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-wrapper>
</template>

<script>
import DatePicker from 'vuejs-datepicker'
import { en, it } from 'vuejs-datepicker/src/locale'
export default {
  components: {
    DatePicker
  },
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Date], default: null },
    min: { type: [String, Number, Date], default: null },
    max: { type: [String, Number, Date], default: null },
    initialView: { type: String, default: 'day' }, // day | month | year
    initialYearAgo: { type: Number, default: null },
    noYear: Boolean
  },
  data () {
    return {
      tmpValue: this._toValidDate(this.value),
      language: this.$i18n.locale,
      languages: {
        en,
        it
      },
      focusTimestamp: 0,
      debounce: this.$utils.createDebounce()
    }
  },
  computed: {
    valueString () {
      return this.tmpValue ? this.$dayjs(this.tmpValue).format('YYYY-MM-DD') : null
    },

    range () {
      let range = null
      if (this.noYear) {
        const year = this.$dayjs().year() + ''
        range = {
          min: this.$dayjs(year, 'YYYY').toDate(),
          max: this.$dayjs(year + '-12-31', 'YYYY-MM-DD').toDate()
        }
      } else {
        range = {
          min: this.min ? this._toValidDate(this.min) : null,
          max: this.max ? this._toValidDate(this.max) : null
        }
      }

      return range
    },

    datePickerOpts () {
      const opts = {
        initialView: this.initialView
      }

      if (this.initialYearAgo) {
        const targetYear = this.$dayjs().year() - this.initialYearAgo
        opts.openDate = this.$dayjs(targetYear + '', 'YYYY').toDate()
      }

      if (this.range) {
        const { min, max } = this.range
        opts.disabledDates = {}

        if (min) {
          opts.disabledDates.to = min
        }

        if (max) {
          opts.disabledDates.from = max
        }
      }

      if (this.noYear) {
        opts.minimumView = 'day'
        opts.maximumView = 'month'
      }

      return opts
    },

    dateInputAttrs () {
      const attrs = {}
      const { min, max } = this.range || {}

      if (min) {
        attrs.min = this.$dayjs(min).format('YYYY-MM-DD')
      }

      if (max) {
        attrs.max = this.$dayjs(max).format('YYYY-MM-DD')
      }

      return attrs
    }
  },
  watch: {
    value (v) {
      this.tmpValue = this._toValidDate(this.value)
    }
  },
  methods: {
    focus () {
      if (this.$refs.input) {
        this.$refs.input.focus()
      }
    },

    onFocus () {
      this.focusTimestamp = Date.now()
    },

    setValue (d, fromPopover = false) {
      this.debounce(() => {
        if (typeof d === 'string' && d.startsWith('0')) {
          // Skip in case of incomplete keyboard input
          return
        }

        // In IOS, input event is trigger with today date right when the focus is triggered
        // Validate agaisnt the focus timestamp to detect this case and ignore the value
        if (Date.now() - this.focusTimestamp < 200) {
          setTimeout(() => {
            this.$refs.input.value = this.valueString
          })
          return
        }

        this.tmpValue = this._toValidDate(d)
        this.$emit('input', this.tmpValue)

        fromPopover && setTimeout(() => {
          this.$refs.popover?.hide()
          this.$refs.input?.blur()
          this.$emit('picked', this.tmpValue)
        })
      }, 50)
    },

    _toValidDate (value) {
      if (!value) {
        return null
      }

      if (value instanceof Date) {
        return value
      }

      const d = this.$dayjs(value).toDate()
      return isNaN(d) ? null : d
    }
  }
}
</script>

<style lang="scss">
.base-date {
  &__popover {
    input[type="date"] {
      @apply relative h-10;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button,
      &::-webkit-calendar-picker-indicator {
        @apply hidden appearance-none;
      }

      &.empty {
        color: var(--color);

        &.is-mobile {
          &::-webkit-datetime-edit,
          &::placeholder {
            @apply hidden appearance-none;
          }

          &::before {
            content: attr(placeholder);
          }
        }
      }
    }
  }

  &__picker {
    &.vdp-datepicker__calendar {
      background-color: #4a4a4a;
      @apply text-white text-opacity-90 border-none rounded-t-none rounded-b-10px overflow-hidden;

      .disabled {
        color: #777;
      }

      .prev {
        &::after {
          border-right-color: white;
        }

        &.disabled::after {
          border-right-color: #777;
        }
      }

      .next {
        &::after {
          border-left-color: white;
        }

        &.disabled::after {
          border-left-color: #777;
        }
      }

      & .up, .prev, .next {
        &:not(.disabled):hover {
          background-color: #404040;
        }
      }

      & .cell {
        &.selected {
          background-color: #404040;
        }

        &:not(.blank):not(.disabled) {
          &.year, &.month, &.day {
            &:hover {
              background-color: #404040;
              border-color: #404040;
            }
          }
        }
      }
    }
  }
}
</style>
