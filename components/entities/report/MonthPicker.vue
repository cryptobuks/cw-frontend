<template>
  <div data-v-a25ae194="" class="bg-gray-150 p-3 rounded-b-xl">
    <div data-v-a25ae194="" class="vdp-datepicker">
      <div class="">
        <!---->
        <input type="hidden" readonly="readonly" autocomplete="off">
        <!---->
      </div>
      <!---->
      <div
        class="datepicker-calendar vdp-datepicker__calendar"
        style="position: static"
      >
        <header class="flex justify-around mb-2">
          <button @click.stop="changeYear(-1)">
            <span class="prev">&lt;</span>
          </button>
          <span class="month__year_btn">{{ getCurrentYear }}</span>
          <button @click.stop="changeYear(+1)">
            <span class="next">&gt;</span>
          </button>
        </header>
        <div class="grid grid-cols-3">
          <span
            v-for="(month, index) in months"
            :key="index"
            class="cell month"
            :style="{ padding: !fullMonthName ? '0 20px' : null }"
            :class="[
              !availableMonths.includes(index + 1) ? 'disabled' : null,
              getOnlySelectedMonths.includes(index + 1) ? 'selected' : null,
            ]"
            @click="() => getSelectedValues(index)"
          >{{ fullMonthName ? month : month.substr(0, 3) }}</span>
        </div>
      </div>
      <!---->
    </div>
  </div>
</template>
<script>
export default {
  props: {
    fullMonthName: { type: Boolean, default: () => true },
    yearAndMonth: { default: () => {}, type: Object }
  },
  data () {
    return {
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      page: null,
      availableMonths: [],
      selectedMonths: []
    }
  },
  computed: {
    getYears () {
      return Object.keys(this.yearAndMonth).sort((a, b) => a - b)
    },
    getCurrentYear () {
      if (this.page !== null) {
        return this.getYears[this.page]
      }
      return this.getYears[this.getYears.length - 1]
    },
    getOnlySelectedMonths () {
      const months = this.selectedMonths
      const newMonth = {}
      for (const key in months) {
        if (newMonth[months[key].year]) {
          newMonth[months[key].year] = {
            months: [...newMonth[months[key].year].months, months[key].month]
          }
        } else {
          newMonth[months[key].year] = {
            months: [months[key].month]
          }
        }
      }
      return newMonth?.[this.getCurrentYear]
        ? newMonth?.[this.getCurrentYear].months
        : []
    }
  },
  watch: {
    availableMonths (val) {
      this.$emit('available-months', { month: val, year: this.getCurrentYear })
    }
  },
  mounted () {
    this.getAvailableMonths()
    // this.page = this.getYears.length - 1;
  },
  methods: {
    getAvailableMonths () {
      this.availableMonths = this.yearAndMonth[this.getCurrentYear]?.months
    },
    changeYear (n) {
      this.page = this.page + n
      if (this.page <= 0) {
        this.page = 0
        this.getAvailableMonths()
        return
      }
      if (this.page >= this.getYears.length - 1) {
        this.page = this.getYears.length - 1
        this.getAvailableMonths()
      }
    },
    getSelectedValues (index) {
      const year = Number(this.getCurrentYear)
      const month = index + 1
      const getIndex = this.selectedMonths.findIndex(
        item => item.year === year && item.month === month
      )

      if (getIndex > -1) {
        this.selectedMonths.splice(getIndex, 1)
      } else {
        this.selectedMonths.push({ year, month })
      }
      this.$emit('get-values', this.selectedMonths)
    }
  }
}
</script>
<style scoped lang="postcss">
&.vdp-datepicker__calendar {
  background: none;
  @apply uppercase text-white text-opacity-90 border-none overflow-hidden mb-2;
}

& header {
  & .up,
  & .prev,
  & .next {
    &:not(.disabled):hover {
      background: none;
    }
  }

  & .prev,
  & .next {
    text-indent: 0;

    &::after {
      border: 0;
    }
  }

  /* & .prev::after {
      content: "<";
    } */

  /* & .next::after {
      content: ">";
    } */
}

.cell {
  @apply inline-flex justify-center items-center bg-white text-black border-4 border-black border-opacity-0 bg-clip-padding rounded-lg p-1 cursor-pointer;
}
.cell.disabled {
  @apply bg-gray-500 text-white cursor-default !important;
  pointer-events: none;
}
.cell.selected {
  @apply bg-green;
}
</style>
