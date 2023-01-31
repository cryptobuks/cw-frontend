<template>
  <div :class="[theme]">
    <input
      v-model="date"
      :class="[`flatpickr-${_uid}`, flatpickrConfig.inline ? 'hidden' : '']"
      type="text"
      placeholder="Select Date.."
    >
  </div>
</template>

<script>
import flatpickr from 'flatpickr'
import l10n from 'flatpickr/dist/l10n'
import MonthSelectPlugin from 'flatpickr/dist/plugins/monthSelect'
import 'flatpickr/dist/plugins/monthSelect/style.css'
export default {
  props: {
    value: { type: null, required: true },
    theme: { type: String, default: 'dark' },
    flatpickrConfig: { type: Object, required: true },
    closeddays: { type: Array, default: () => [] },
    monthSelect: { type: Boolean, default: () => false }
  },
  data: () => ({
    date: null,
    indcloseddays: []
  }),
  watch: {
    date: {
      deep: true,
      handler (date) {
        this.$emit('input', date)
      }
    }
  },
  created () {
    this.date = this.value
    this.indcloseddays = this.closeddays
    this.$forceUpdate()
  },
  mounted () {
    const indexcloseddays = this.indcloseddays
    const flatpickrInstance = flatpickr(`.flatpickr-${this._uid}`, {
      ...this.flatpickrConfig,
      onDayCreate (dObj, dStr, fp, dayElem) {
        for (const closedday of indexcloseddays) {
          if (dayElem.dateObj.getDay() === closedday) {
            dayElem.className += ' closedDays'
          }
        }
      },
      onChange () {
        for (const closedday of indexcloseddays) {
          if (flatpickrInstance.selectedDates[0].getDay() === closedday) {
            document
              .getElementsByClassName('flatpickr-day selected')[0]
              .setAttribute('class', 'flatpickr-day closedSelectedDay')
          }
        }
      },
      onMonthChange () {
        if (flatpickrInstance.selectedDates.length > 0) {
          for (const closedday of indexcloseddays) {
            if (flatpickrInstance.selectedDates[0].getDay() === closedday) {
              document
                .getElementsByClassName('flatpickr-day selected')[0]
                .setAttribute('class', 'flatpickr-day closedSelectedDay')
            }
          }
        }
      },
      onYearChange () {
        for (const closedday of indexcloseddays) {
          if (flatpickrInstance.selectedDates[0].getDay() === closedday) {
            document
              .getElementsByClassName('flatpickr-day selected')[0]
              .setAttribute('class', 'flatpickr-day closedSelectedDay')
          }
        }
      },
      plugins: this.monthSelect
        ? [
          new MonthSelectPlugin({
            shorthand: true, // defaults to false
            dateFormat: 'm.y', // defaults to "F Y"
            altFormat: 'F Y', // defaults to "F Y"
            theme: 'light' // defaults to "light"
          })
        ]
        : [],
      locale: l10n[this.$i18n.locale],
      defaultDate: this.value
    })

    this.$on('hook:beforeDestroy', () => {
      flatpickrInstance.destroy()
    })
  }
}
</script>

<style>
.closedDays {
  @apply bg-red bg-opacity-50 !important;
}

.closedSelectedDay {
  @apply text-white rounded-full bg-red !important;
}

.flatpickr-calendar {
  @apply w-full mb-4 shadow-none rounded-lg !important;
}

.flatpickr-calendar .flatpickr-months,
.flatpickr-calendar .flatpickr-month {
  @apply rounded-t-lg !important;
}

.flatpickr-calendar .flatpickr-months .flatpickr-prev-month,
.flatpickr-calendar .flatpickr-months .flatpickr-next-month {
  @apply z-10 !important;
}

.flatpickr-calendar .flatpickr-rContainer,
.flatpickr-calendar .flatpickr-days,
.flatpickr-calendar .dayContainer {
  @apply w-full !important;
}

.flatpickr-calendar .dayContainer {
  @apply grid grid-cols-7 max-w-full gap-x-0  !important;
}

.flatpickr-calendar .flatpickr-day {
  @apply max-w-full w-full !important;
}

.flatpickr-calendar .flatpickr-day.selected,
.flatpickr-day.startRange,
.flatpickr-day.endRange {
  @apply rounded-full !important;
}

.flatpickr-calendar
  .flatpickr-day.selected.startRange
  + .endRange:not(:nth-child(7n + 1)),
.flatpickr-calendar
  .flatpickr-day.startRange.startRange
  + .endRange:not(:nth-child(7n + 1)),
.flatpickr-calendar
  .flatpickr-day.endRange.startRange
  + .endRange:not(:nth-child(7n + 1)) {
  @apply shadow-none !important;
}

.dark .flatpickr-calendar,
.dark .flatpickr-calendar span.flatpickr-weekday,
.dark .flatpickr-calendar .flatpickr-months,
.dark .flatpickr-calendar .flatpickr-month,
.dark
  .flatpickr-calendar
  .flatpickr-current-month
  .flatpickr-monthDropdown-months {
  @apply bg-gray-700 text-white !important;
}

.dark .flatpickr-months .flatpickr-prev-month,
.dark .flatpickr-months .flatpickr-next-month {
  color: #fff;
  fill: #fff;
}

.flatpickr-innerContainer
  .flatpickr-rContainer
  .flatpickr-monthSelect-months
  .dark
  .flatpickr-months
  .flatpickr-prev-month:hover
  svg,
.dark .flatpickr-months .flatpickr-next-month:hover svg {
  @apply text-gray-300 fill-current !important;
}

.dark .flatpickr-calendar .flatpickr-day {
  @apply text-white !important;
}

.dark .flatpickr-calendar .flatpickr-day.inRange {
  @apply bg-gray-500 border-gray-500 text-white shadow-none !important;
}

.dark .flatpickr-calendar .flatpickr-day.selected,
.dark .flatpickr-day.startRange,
.dark .flatpickr-day.endRange {
  @apply bg-gray-600 border-gray-600 !important;
}

.dark .flatpickr-calendar .flatpickr-day.flatpickr-disabled,
.dark .flatpickr-calendar .flatpickr-day.flatpickr-disabled:hover {
  @apply text-gray-600 !important;
}

.dark .flatpickr-calendar .flatpickr-day.today {
  @apply border-gray-600 font-bold bg-gray-600 !important;
}

.light .flatpickr-calendar {
  @apply text-gray-700 bg-white !important;
}

.light .flatpickr-months .flatpickr-prev-month:hover svg,
.light .flatpickr-months .flatpickr-next-month:hover svg {
  @apply text-green fill-current !important;
}

.light .flatpickr-calendar .flatpickr-day.inRange {
  @apply bg-green bg-opacity-25 shadow-none !important;
}

.light .flatpickr-calendar .flatpickr-day.today {
  @apply text-red font-bold border-none bg-transparent !important;
}

.light .flatpickr-calendar .flatpickr-day.selected,
.light .flatpickr-day.startRange,
.light .flatpickr-day.endRange {
  @apply bg-green border-green text-white !important;
}

.light .flatpickr-calendar .flatpickr-day.flatpickr-disabled,
.light .flatpickr-calendar .flatpickr-day.flatpickr-disabled:hover {
  @apply text-gray-400 !important;
}
</style>
