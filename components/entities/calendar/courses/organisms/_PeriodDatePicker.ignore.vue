<template>
  <base-input-text
    ref="baseInput"
    input-class="hidden"
    :clearable="false"
    v-bind="$attrs"
    v-on="$listeners"
    @input="$emit('input', $event)"
  >
    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-text>
</template>

<script>
import flatpickr from 'flatpickr'
import { Italian } from 'flatpickr/dist/l10n/it'

export default {
  props: {
    value: { type: [String, Date, Array], default: '' }
  },
  mounted () {
    const flatpickrInstance = this.initFlatPickr()
    flatpickrInstance.calendarContainer.classList.add('course-modal-period-date-picker')

    this.$watch('value', (v) => {
      flatpickrInstance.setDate(v)
    })

    this.$on('hook:beforeDestroy', () => {
      flatpickrInstance.destroy()
    })
  },
  methods: {
    initFlatPickr () {
      const lang = this.$route.query.language
      const locale = lang === 'en' || lang === 'it' ? lang : 'en'
      const languages = { it: Italian }

      return flatpickr(this.$refs.baseInput.$refs.input, {
        mode: 'range',
        dateFormat: 'Z',
        altInput: true,
        altInputClass: 'cursor-pointer',
        altFormat: 'd/m/Y',
        locale: ({
          ...languages[locale],
          weekdays: {
            shorthand: locale === 'en'
              ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
              : ['L', 'M', 'M', 'G', 'V', 'S', 'D']
          },
          firstDayOfWeek: 1,
          rangeSeparator: ' - '
        }),
        defaultDate: this.value,
        minDate: new Date(),
        onOpen: () => {
          this.$attrs.listeners?.focus && this.$attrs.listeners.focus()
        }
      })
    }
  }
}
</script>

<style lang="postcss">
.course-modal-period-date-picker {
  --sea-green: #86cf9e;
  --dark-sea-green: #688d74;

  &.flatpickr-calendar {
    @apply bg-gray-700 shadow-md;
  }

  &.arrowTop,
  &.arrowBottom {
    &::before,
    &::after {
      @apply hidden;
    }
  }

  & .flatpickr-current-month {
    left: 12px;
    @apply text-white text-sm text-left;

    & select {
      @apply appearance-none;
    }
  }

  & .flatpickr-current-month .flatpickr-monthDropdown-month {
    @apply bg-gray-750 text-white px-1;
  }

  & input.cur-year::selection {
    background-color: var(--sea-green);
  }

  & .flatpickr-prev-month,
  & .flatpickr-next-month {
    color: var(--sea-green);
    border-radius: 35%;
    @apply bg-white h-auto transform translate-y-full p-1;

    & svg {
      width: 10px;
      height: 10px;
      @apply stroke-current;
    }
  }

  & .flatpickr-next-month {
    right: 15px !important;
  }

  & .flatpickr-prev-month {
    left: initial !important;
    right: 43px;
  }

  & .flatpickr-weekdays {
    @apply mt-5;
  }

  & .flatpickr-weekday {
    color: var(--sea-green);
  }

  & .flatpickr-day {
    &.flatpickr-disabled {
      @apply text-gray-500;
    }

    &:not(.flatpickr-disabled) {
      @apply text-white;

      &.today {
        color: var(--sea-green);
        border-color: var(--sea-green);

        &.selected,
        &:hover {
          color: white;
        }
      }

      &:hover,
      &:focus,
      &.selected,
      &.startRange,
      &.endRange {
        background-color: var(--sea-green);
        border-color: var(--sea-green);
        @apply text-white !important;
      }

      &.startRange:not(.endRange),
      &.endRange:not(.startRange) {
        &:not(.inRange) {
          @apply relative rounded-full;

          &::before {
            content: '';
            background-color: var(--dark-sea-green);
            height: calc(100% + 2px);
            top: -1px;
            z-index: -1;
            @apply absolute block w-1/2;
          }
        }
      }

      &.startRange::before {
        right: -1px;
      }

      &.endRange::before {
        left: -1px;
      }

      &.startRange + .endRange {
        @apply shadow-none;

        &::before {
          box-shadow: -5px 0 0 var(--dark-sea-green) !important;
        }
      }

      &.inRange {
        background-color: var(--dark-sea-green);
        border-color: var(--dark-sea-green);
        box-shadow: -5px 0 0 var(--dark-sea-green), 5px 0 0 var(--dark-sea-green);
      }
    }

    &:nth-of-type(7n):not(.inRange) {
      color: var(--sea-green);

      &.flatpickr-disabled {
        color: var(--dark-sea-green);
      }
    }
  }
}
</style>
