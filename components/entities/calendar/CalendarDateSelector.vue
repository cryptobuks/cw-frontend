<template>
  <div class="w-full min-w-full grid grid-cols-5">
    <div
      v-for="({ text, value, isToday, isSelected }, i) in dates"
      :key="i"
      class="flex items-center justify-center px-4"
    >
      <label
        class="w-full bg-white text-center text-lg font-semibold rounded-10px py-3 cursor-pointer transition-colors duration-100"
        :class="{
          'text-cw-red': isToday && !isSelected,
          'bg-cw-red text-white lg:text-current lg:bg-white': isSelected
        }"
      >
        <input
          type="radio"
          :checked="isSelected"
          @change="$emit('select-date', value)"
        >
        <span>{{ text }}</span>
      </label>
    </div>
  </div>
</template>

<script>
import CalendarDateSelectorMixin from '@/mixins/CalendarDateSelectorMixin'

export default {
  mixins: [CalendarDateSelectorMixin],
  data: () => ({
    isMinWidth1250: null
  }),
  computed: {
    dates () {
      const output = []
      const n = 5
      for (let i = 0; i < n; i++) {
        const d = new Date(this.baseDate.getTime())
        d.setDate(this.baseDate.getDate() + this.dateShift * n + i)
        const weekday = this.$t(`days.${this.weekdays[d.getDay()]}`)
        output.push({
          text: `${
            this.isMinWidth1250 ? weekday : weekday.slice(0, 2)
          } ${d.getDate()}`,
          value: d,
          isToday: this.today.getTime() === d.getTime(),
          isSelected: this.selectedDate?.getTime() === d.getTime()
        })
      }

      return output
    },
    month () {
      return this.dates[0].value.getMonth()
    }
  },
  watch: {
    month () {
      this.$emit('change-month', this.dates[0].value)
    },
    dates: {
      immediate: true,
      deep: true,
      handler (dates) {
        this.$emit('change-dates', dates)
      }
    }
  },
  mounted () {
    const mql = window.matchMedia('(min-width: 1250px)')
    const handleMediaChange = (e) => {
      this.isMinWidth1250 = e.matches
    }

    mql.addListener(handleMediaChange)
    this.$on('hook:beforeDestroy', () => {
      mql.removeListener(handleMediaChange)
    })
  }
}
</script>
