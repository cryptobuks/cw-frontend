<template>
  <base-main-card>
    <template #header>
      <div class="flex justify-between w-full">
        <div class="flex items-center">
          <button @click="$router.push('/reports/contacts')">
            <base-icon name="chevron-left" />
          </button>
          <h2 class="font-extrabold text-md">
            {{ $t("report.trend_access") }}
          </h2>
          <base-icon
            v-tippy="{
              content: $t('trend_access_tooltip'),
              placement: 'bottom',
            }"
            name="question-circle"
            size="20"
            style="margin-left: 16px"
          />
        </div>
        <div class="flex items-center">
          <base-popover ref="monthModal" :offset-y="20">
            <template #activator>
              <base-icon name="chevron-left" />
              <span class="text-sm font-bold"> {{ getRange }}</span>
              <base-icon name="chevron-right" />
            </template>

            <div class="bg-gray-150 p-3 rounded-b-xl">
              <cw-month-picker
                :full-month-name="false"
                :year-and-month="getMonthsAndYear"
                @get-values="getValues"
                @available-months="getAvailableMonths"
              />
              <!-- <base-flatpickr
                v-model="date"
                v-bind="{
                  flatpickrConfig: {
                    inline: true,
                    mode: 'multiple',
                  },
                  theme: 'light',
                }"
              /> -->
              <!-- <date-picker
                calendar-class="datepicker-calendar"
                minimum-view="month"
                :disabled-dates="disabledMonths"
                maximum-view="month"
                inline
                :full-month-name="false"
              /> -->
              <base-button @click="resetContactMonths">
                <base-icon name="save" />
              </base-button>
            </div>
          </base-popover>
          <base-icon name="calendar-today" @click="() => getStats()" />
        </div>
        <div>
          <base-popover :offset-y="20">
            <template #activator>
              <div class="flex items-center">
                <base-icon name="delta" />
                <p class="text-md mr-2">
                  YOY
                </p>
                <base-icon name="chevron-down" />
              </div>
            </template>

            <div class="bg-gray-150 p-3 rounded-b-xl">
              <div
                v-for="(item, index) in periodComparisons"
                :key="index"
                class="text-black p-2 rounded-xl cursor-pointer"
                :class="[
                  index !== activePeriodIndex ? 'bg-gray-500' : 'bg-white',
                ]"
                @click="changePeriodComparison(index)"
              >
                {{ item.name }}
              </div>
            </div>
          </base-popover>
        </div>
      </div>
    </template>
    <template #default>
      <h1 class="text-center text-white font-extrabold text-xl">
        {{ $t("report.trend_access") }} + {{ $t("report.budget") }} +
        <base-icon name="delta" style="color: white" />
      </h1>
      <base-graph :options="options" class="w-full h-full" />
    </template>
  </base-main-card>
</template>
<script>
import _ from 'lodash'
export default {
  data () {
    return {
      date: '',
      contactValues: [],
      availableMonths: [],
      currentYear: '',
      calendarMonths: [
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
      activeContactTypeIndex: 0,
      stats: [],
      months: [],
      allContact: [
        {
          color: 'red',
          type: 'active',
          name: this.$t('report.active_contact')
        },
        {
          color: 'blue',
          type: 'cold',
          name: this.$t('report.cold_contact')
        },
        {
          color: 'yellow',
          type: 'companies',
          name: this.$t('report.company_contact')
        }
      ],
      activePeriodIndex: 0,
      periodComparisons: [
        { name: this.$t('report.previous_year'), type: 'year' },
        { name: this.$t('report.previous_period'), type: 'month' }
      ]
    }
  },
  computed: {
    getMonthsAndYear () {
      const months = this.months
      const newMonth = {}
      for (const key in months) {
        if (newMonth[months[key].year]) {
          newMonth[months[key].year] = {
            months: [
              ...newMonth[months[key].year].months,
              Number(months[key].month)
            ]
          }
        } else {
          newMonth[months[key].year] = {
            months: [Number(months[key].month)]
          }
        }
      }
      return newMonth
    },
    options () {
      return {
        xAxis: [
          {
            type: 'category',
            position: 'bottom',
            axisLabel: {
              color: 'white'
            },
            data: this.getGraphAxis
          },
          {
            type: 'category',
            position: 'bottom',
            show: false,
            axisLabel: {
              color: 'white'
            },
            data: this.getGraphAxis
          },
          {
            type: 'category',
            position: 'bottom',
            show: false,
            axisLabel: {
              color: 'white'
            },
            data: this.getGraphAxis
          }
        ],
        dataZoom: [
          {
            type: 'slider',
            start: 100 - (9 / this.getGraphData.length) * 100,
            end: 100,
            zoomLock: true,
            zoomOnMouseWheel: false,
            bottom: 0,
            brushSelect: false,
            show: this.getGraphData.length > 8
          }
        ],
        yAxis: [
          {
            type: 'value',
            max: this.graphMax,
            splitLine: {
              lineStyle: {
                color: 'gray',
                type: 'dashed'
              },
              show: false
            },
            interval: _.ceil(this.graphMax / 6, 1),
            axisLabel: {
              formatter: '{value}',
              color: 'white'
            }
          },
          {
            type: 'value',
            min: 0,
            max: 25,
            splitLine: {
              lineStyle: {
                color: 'gray',
                type: 'dashed'
              },
              show: true
            },
            interval: 5,
            axisLabel: {
              formatter: '{value}%',
              color: 'white'
            }
          }
        ],
        legend: {
          data: [
            'Messages per active profiles',
            'D Messages per active profiles',
            'Budget on messages on active profile'
          ],
          top: 0,
          itemGap: 20,
          // padding: [
          //   50, // up
          //   0, // right
          //   0, // down
          //   0, // left
          // ],
          textStyle: {
            color: 'white',
            fontSize: '18'
          },
          z: 10
        },
        tooltip: {
          show: true
        },
        series: [
          {
            data: this.getGraphData.map(item =>
              item.budget - 5 >= 0 ? item.budget - 5 : 0
            ),
            type: 'bar',
            stack: 'budget',
            xAxisIndex: 0,
            barWidth: '70%',
            itemStyle: {
              color: 'transparent'
            }
          },
          {
            data: Array(this.getGraphData?.length).fill(5),
            type: 'bar',
            name: 'Budget on messages on active profile',
            stack: 'budget',
            barWidth: '70%',
            xAxisIndex: 0,
            itemStyle: {
              color: 'gray',
              borderType: 'dotted',
              borderColor: 'red',
              borderWidth: 1.5
            },
            labelLine: {
              lineStyle: {
                type: 'dotted'
              }
            },
            tooltip: {}
          },
          {
            data: this.getGraphData.map(item => item.sent + item.received),
            type: 'bar',
            xAxisIndex: 1,
            name: 'Messages per active profiles',
            barWidth: '50%',
            itemStyle: {
              color: this.getCurrentType.color
            }
          },
          {
            data: this.getGraphPrevious.map(item => item.count),
            type: 'bar',
            xAxisIndex: 2,
            barWidth: '30%',
            name: 'D Messages per active profiles',
            itemStyle: {
              color: '#aaaaaaaa',
              borderType: 'dotted',
              borderColor: 'white',
              borderWidth: 3.5
            },
            labelLine: {
              lineStyle: {
                type: 'dotted'
              }
            },
            tooltip: {}
          }
        ]
      }
    },
    getGraphData () {
      const stats = this.stats.current
      let data = []
      for (const key in stats) {
        const filteredStat = Object.values(stats[key].data).map(item => item)
        data = [...data, ...filteredStat]
      }
      return data
    },
    getGraphPrevious () {
      const stats = this.stats.previous
      let data = []
      for (const key in stats) {
        const filteredStat = Object.values(stats[key].data).map(item => item)
        data = [...data, ...filteredStat]
      }
      return data
    },
    getGraphAxis () {
      const stats = this.stats.current
      let data = []
      for (const key in stats) {
        const filteredStat = Object.keys(stats[key].data).map(item =>
          item
            .concat('-')
            .concat(this.calendarMonths[stats[key].month - 1].substr(0, 3))
        )
        data = [...data, ...filteredStat]
      }
      return data
    },
    getCurrentType () {
      return this.allContact[this.activeContactTypeIndex]
    },
    graphMax () {
      return (
        _.ceil(
          _.max([
            _.maxBy(this.getGraphData, 'sent')?.sent +
              _.maxBy(this.getGraphData, 'received')?.received
          ]),
          -1
        ) + 10
      )
    },
    getRange () {
      const maxNumbers = this.availableMonths
      return maxNumbers.length > 1
        ? this.calendarMonths[maxNumbers.sort((a, b) => a - b)[0] - 1]
          .substr(0, 3)
          .concat(' - ')
          .concat(
            this.calendarMonths[
              maxNumbers[maxNumbers.sort((a, b) => a - b).length - 1] - 1
            ].substr(0, 3)
          )
          .concat(' ')
          .concat(this.currentYear)
        : this.calendarMonths[maxNumbers[0] - 1]
          ?.substr(0, 3)
          .concat(' ')
          .concat(this.currentYear)
    }
  },
  watch: {
    getMonthsAndYear (val) {
      this.availableMonths = val[new Date().getFullYear()]?.months
      this.currentYear = new Date().getFullYear()
    }
  },
  async mounted () {
    this.months = await this.$repos.statRepo.getTrendContactsMonth()
    await this.getStats()
  },
  methods: {
    async getStats (
      payload = [
        { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
      ]
    ) {
      this.stats = await this.$repos.statRepo.getTrendContactsStats({
        periods: payload,
        type: this.periodComparisons[this.activePeriodIndex].type
      })
    },
    getValues (value) {
      this.contactValues = value
    },
    async resetContactMonths () {
      await this.getStats(this.contactValues)
      this.$refs.monthModal.hide()
    },
    selectContactType (index) {
      this.activeContactTypeIndex = index
      this.$refs.contactSelection.hide()
    },
    changePeriodComparison (index) {
      this.activePeriodIndex = index
      this.contactValues && this.contactValues.length
        ? this.getStats(this.contactValues)
        : this.getStats()
    },
    getAvailableMonths ({ month, year }) {
      this.availableMonths = month
      this.currentYear = year
    }
  }
}
</script>
