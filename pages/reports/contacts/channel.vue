<template>
  <base-main-card>
    <template #header>
      <div class="grid grid-cols-3 w-full">
        <div class="flex items-center">
          <button @click="$router.push('/reports/contacts')">
            <base-icon name="chevron-left" />
          </button>
          <h2 class="font-extrabold text-md">
            {{ $t("report.channel") }}
          </h2>
          <base-icon
            v-tippy="{
              content: $t('report.channel_tooltip'),
              placement: 'bottom',
            }"
            name="question-circle"
            size="20"
            style="margin-left: 16px"
          />
        </div>
        <div class="flex items-center justify-center">
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
                @available-months="getAvailableMonths"
                @get-values="getValues"
              />
              <base-button @click="resetContactMonths">
                <base-icon name="save" />
              </base-button>
            </div>
          </base-popover>
          <base-icon name="calendar-today" @click="() => getStats()" />
        </div>
        <div class="flex items-center justify-center">
          <base-popover ref="contactSelection" :offset-y="20">
            <template #activator>
              <div class="flex items-center">
                <div
                  class="h-4 w-4 rounded-full mr-2"
                  :style="{
                    backgroundColor: getCurrentType.color,
                  }"
                />
                <p class="text-md font-light mr-2">
                  {{ getCurrentType.name }}
                </p>
                <base-icon name="chevron-down" />
              </div>
            </template>

            <div class="bg-gray-150 p-3 rounded-b-xl">
              <div
                v-for="(item, index) in allContact"
                :key="index"
                :class="[
                  index !== activeContactTypeIndex ? 'bg-gray-500' : 'bg-white',
                ]"
                class="text-black p-2 rounded-xl mb-2"
                @click="selectContactType(index)"
              >
                <span class="flex items-center">
                  <div
                    class="h-4 w-4 rounded-full mr-2"
                    :style="{ backgroundColor: item.color }"
                  />
                  <p>{{ item.name }}</p>
                </span>
              </div>
            </div>
          </base-popover>
        </div>
      </div>
    </template>
    <template #default>
      <!-- <h1 class="text-center text-white font-extrabold text-xl">
        {{ $t("report.active_trend_contacts") }} + {{ $t("report.budget") }} +
        <base-icon name="delta" style="color: white" />
      </h1> -->
      <base-graph ref="chat" :options="options" class="w-full h-full" />
    </template>
  </base-main-card>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import _ from 'lodash'
export default {
  data () {
    return {
      months: [],
      stats: [],
      contactValues: [],
      availableMonths: [],
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
        }
      ],
      currentYear: '',
      activeContactTypeIndex: 0,
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
      ]
    }
  },
  computed: {
    options () {
      return {
        backgroundColor: 'black',
        textStyle: {
          color: '#c0c3cd',
          fontSize: 14
        },
        toolbox: {
          show: false,
          feature: {
            saveAsImage: {
              backgroundColor: '#031245'
            },
            restore: {}
          },
          iconStyle: {
            borderColor: '#c0c3cd'
          }
        },
        legend: {
          top: 0,
          itemWidth: 8,
          itemHeight: 8,
          icon: 'circle',
          left: 'center',
          padding: 0,
          textStyle: {
            color: '#c0c3cd',
            fontSize: 14,
            padding: [2, 0, 0, 0]
          }
        },
        color: [
          '#63caff',
          '#49beff',
          '#03387a',
          '#03387a',
          '#03387a',
          '#6c93ee',
          '#a9abff',
          '#f7a23f',
          '#27bae7',
          '#ff6d9d',
          '#cb79ff',
          '#f95b5a',
          '#ccaf27',
          '#38b99c',
          '#93d0ff',
          '#bd74e0',
          '#fd77da',
          '#dea700'
        ],
        grid: {
          containLabel: true,
          left: 20,
          right: 20,
          bottom: 10,
          top: 40
        },
        xAxis: {
          nameTextStyle: {
            color: '#c0c3cd',
            padding: [0, 0, -10, 0],
            fontSize: 14
          },
          axisLabel: {
            color: '#c0c3cd',
            fontSize: 14,
            interval: 0
          },
          axisTick: {
            lineStyle: {
              color: '#384267',
              width: 1
            },
            show: true
          },
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#384267',
              width: 1,
              type: 'dashed'
            },
            show: true
          },
          data: this.getGraphAxis,
          type: 'category'
        },
        yAxis: {
          nameTextStyle: {
            color: '#c0c3cd',
            padding: [0, 0, -10, 0],
            fontSize: 14
          },
          axisLabel: {
            color: '#c0c3cd',
            formatter: '{value}%',
            fontSize: 14
          },
          axisTick: {
            lineStyle: {
              color: '#384267',
              width: 1
            },
            show: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#384267',
              type: 'dashed'
            }
          },
          min: 0,
          max: _.ceil(_.max(this.graphMax), -1),
          axisLine: {
            lineStyle: {
              color: '#384267',
              width: 1,
              type: 'dashed'
            },
            show: true
          },
          name: ''
        },
        series: [
          ...this.getGraphData,
          {
            name: '',
            type: 'pictorialBar',
            symbolSize: [30, 7],
            symbolOffset: [0, -5],
            symbolPosition: 'end',
            data: this.graphMax,
            z: 12
          },
          {
            name: '',
            type: 'pictorialBar',
            symbolPosition: 'start',
            symbolSize: [30, 7],
            symbolOffset: [0, -2],
            data: Array(this.getGraphAxis.length).fill(-1),
            z: 12
          }
        ],
        tooltip: {
          trigger: 'axis',
          show: true
        }
      }
    },
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
    ...mapGetters({
      getSport: 'settings/getSport'
    }),
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
    getGraphData () {
      const stats = this.stats.current

      const reformed = {}
      const max = stats?.reduce((acc, { data }) => {
        const mewData = acc
        for (const key in data) {
          mewData.push({ ...data[key] })
        }
        return mewData
      }, [])

      max?.forEach((item, index) => {
        item[this.getCurrentType.type].forEach((sport) => {
          if (reformed[sport.channel]) {
            reformed[sport.channel][index] = sport.count
          } else {
            reformed[sport.channel] = Array(max.length).fill('_')
            reformed[sport.channel][index] = sport.count
          }
        })
      })

      return Object.keys(reformed).map((item) => {
        return {
          type: 'bar',
          stack: 'channel',
          barMaxWidth: 'auto',
          barWidth: 30,
          name: item,
          data: reformed[item]
        }
      })
    },
    graphMax () {
      const stats = this.stats.current
      const maxNumbers = []
      for (const key in stats) {
        Object.values(stats[key].data).forEach((item) => {
          maxNumbers.push(
            _.reduce(
              item[this.getCurrentType.type],
              function (sum, { count }) {
                return sum + count
              },
              0
            )
          )
        })
      }
      return maxNumbers
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
    },
    getCurrentType () {
      return this.allContact[this.activeContactTypeIndex]
    }
  },
  watch: {
    getMonthsAndYear (val) {
      this.availableMonths = val[new Date().getFullYear()]?.months
      this.currentYear = new Date().getFullYear()
    }
  },
  async mounted () {
    this.months = await this.$repos.statRepo.getAcquisitionContactsMonth()
    await this.getStats()
    await this.getSportInterests()
  },
  methods: {
    ...mapActions({
      getSportInterests: 'settings/getSportInterests'
    }),
    async getStats (
      payload = [
        { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
      ]
    ) {
      this.stats = await this.$repos.statRepo.getAcquisitionContactsStats({
        periods: payload
      })
    },
    getValues (value) {
      this.contactValues = value
    },
    selectContactType (index) {
      this.activeContactTypeIndex = index
      this.$refs.contactSelection.hide()
    },
    async resetContactMonths () {
      await this.getStats(this.contactValues)
      this.$refs.monthModal.hide()
    },
    getAvailableMonths ({ month, year }) {
      this.availableMonths = month
      this.currentYear = year
    }
  }
}
</script>
