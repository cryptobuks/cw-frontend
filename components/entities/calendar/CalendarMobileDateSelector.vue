<template>
  <div ref="wrapper" class="selector-wrapper flex">
    <label
      v-for="({ text, value, isToday }, i) in dates"
      :key="i"
      :data-base-date="baseDate.getTime() === value.getTime()"
      class="mobile-date-selector"
      :class="{ 'text-cw-red': isToday, selected: selectedDate && selectedDate.getTime() === value.getTime() }"
      :style="{ marginRight: spacing + 'px' }"
    >
      <input type="radio" :checked="selectedDate && selectedDate.getTime() === value.getTime()" @change="$emit('select-date', value)">
      <span>{{ text.weekday }}</span>
      <span>{{ text.date }}</span>
    </label>
  </div>
</template>

<script>
import CalendarDateSelectorMixin from '@/mixins/CalendarDateSelectorMixin'

export default {
  mixins: [CalendarDateSelectorMixin],
  data () {
    return {
      dates: [],
      spacing: 0,
      month: this.baseDate.getMonth()
    }
  },
  watch: {
    baseDate () {
      this.init()
      this.$nextTick(() => {
        this.scrollToBaseDate()
      })
    }
  },
  created () {
    this.init()
  },
  mounted () {
    const wrapper = this.$refs.wrapper

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0] // checking for chrome as using a non-standard array
            : entry.contentBoxSize
          const width = contentBoxSize.inlineSize
          this.spacing = Math.floor((width - wrapper.firstChild.clientWidth * 7) / 6)

          // wait for spacing to be applied
          this.$nextTick(() => {
            this.scrollToBaseDate()
          })
        }
      })
    })

    resizeObserver.observe(wrapper)

    let watchEdges = true
    const threshold = wrapper.firstChild.clientWidth * 2 + this.spacing

    const scrollHandler = () => {
      const selectors = wrapper.children
      const i = this.bisectSelectors(wrapper, selectors, 0, selectors.length - 1)
      const newMonth = this.dates[i].value.getMonth()
      const isMonthChanged = this.month !== newMonth
      if (isMonthChanged) {
        this.$emit('change-month', this.dates[i].value)
      }
      this.month = newMonth

      if (watchEdges) {
        // close to left edge - add another week to the left
        if (wrapper.scrollLeft < threshold) {
          watchEdges = false // temporarily suspend scroll handling

          const leftmostDate = this.dates[0].value
          const startDate = new Date(leftmostDate.getTime()) // clone it
          startDate.setDate(startDate.getDate() - 7)

          const week = this.getWeek(startDate)
          this.dates = week.concat(this.dates)

          // re-enable scroll handling after new dates are added to the DOM + preserve scroll position
          this.$nextTick(() => {
            wrapper.scrollLeft += wrapper.clientWidth
            watchEdges = true
          })
        // close to right edge - add another week to the right
        } else if (wrapper.scrollWidth - wrapper.clientWidth - wrapper.scrollLeft < threshold) {
          watchEdges = false

          const rightmostDate = this.dates[this.dates.length - 1].value
          const startDate = new Date(rightmostDate.getTime())
          startDate.setDate(startDate.getDate() + 1)

          const week = this.getWeek(startDate)
          this.dates = this.dates.concat(week)

          this.$nextTick(() => {
            watchEdges = true
          })
        }
      }
    }

    wrapper.addEventListener('scroll', scrollHandler)

    this.$on('hook:beforeDestroy', () => {
      resizeObserver.disconnect()
      wrapper.removeEventListener('scroll', scrollHandler)
    })
  },
  methods: {
    init () {
      this.dates = []
      // one full week with one week before and one week after
      for (let i = 0; i < 3; i++) {
        const startDate = new Date(this.baseDate.getTime())
        startDate.setDate(startDate.getDate() + (i - 1) * 7)
        const week = this.getWeek(startDate)
        this.dates = this.dates.concat(week)
      }
    },
    scrollToBaseDate () {
      const wrapper = this.$refs.wrapper
      const baseDateSelector = wrapper.querySelector('label[data-base-date=true]')
      wrapper.scrollLeft = baseDateSelector.offsetLeft - wrapper.offsetLeft
    },
    /**
     * @param {Date} startDate
     */
    getWeek (startDate) {
      const output = []

      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate.getTime())
        d.setDate(d.getDate() + i)
        const weekday = this.$t(`days.${this.weekdays[d.getDay()]}`)
        output.push({
          text: { weekday: weekday[0], date: d.getDate().toString().padStart(2, '0') },
          value: d,
          isToday: this.today.getTime() === d.getTime()
        })
      }

      return output
    },
    /**
     * Bisecting because it's much more efficient than linearly traversing the list of selectors - O(log(n)),
     * Note that the list could grow without bounds in either direction as the user scrolls to the left or right.
     *
     * @param {HTMLElement} wrapper
     * @param {HTMLElement[]} selectors
     * @param {number} i
     * @param {number} j
     * @returns {number} the index of the selector that determines the current month
     */
    bisectSelectors (wrapper, selectors, i, j) {
      const index = i + Math.floor((j - i) / 2)
      const a = selectors[index]
      const b = selectors[index + 1]

      const aLeft = a.getBoundingClientRect().left
      const bLeft = b.getBoundingClientRect().left
      const wrapperLeft = wrapper.getBoundingClientRect().left

      if (aLeft <= wrapperLeft && bLeft > wrapperLeft) {
        return index
      } else if (aLeft < wrapperLeft) {
        return this.bisectSelectors(wrapper, selectors, index, j)
      } else {
        return this.bisectSelectors(wrapper, selectors, i, index)
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.selector-wrapper {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
  @apply overflow-x-scroll;

  &::-webkit-scrollbar {
    height: 0;
    background: transparent; /* Chrome/Safari/Webkit */
  }
}

.mobile-date-selector {
  width: 44px;
  @apply flex-shrink-0 flex flex-col justify-center items-center bg-white h-12 text-xs rounded-md cursor-pointer transition-colors duration-100;
}
</style>
