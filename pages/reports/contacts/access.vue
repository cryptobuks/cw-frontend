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
              content: $t('report.gym_access'),
              placement: 'bottom',
            }"
            name="question-circle"
            size="20"
            style="margin-left: 16px"
          />
        </div>
        <div>
          <base-popover ref="monthModal" :offset-y="20">
            <template #activator>
              <base-icon name="chevron-left" />
              <span class="text-sm font-bold"> Jan - Sep 19</span>
              <base-icon name="chevron-right" />
              <base-icon name="calendar-today" />
            </template>

            <div class="bg-gray-150 p-3 rounded-b-xl">
              <cw-month-picker
                :full-month-name="false"
                :year-and-month="getMonthsAndYear"
                @get-values="getValues"
              />
              <base-button @click="resetContactMonths">
                <base-icon name="save" />
              </base-button>
            </div>
          </base-popover>
        </div>
        <div>
          <base-popover :offset-y="20">
            <template #activator>
              <div class="flex items-center">
                <p class="text-md font-light mr-2">
                  Gym access unique
                </p>
                <base-icon name="chevron-down" />
              </div>
            </template>

            <div class="bg-gray-150 p-3 rounded-b-xl">
              <div
                v-for="(item, index) in allContact"
                :key="index"
                class="bg-white text-black p-2 rounded-xl mb-2"
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
              <div class="bg-white text-black p-2 rounded-xl">
                {{ $t("report.previous_year") }}
              </div>
              <div class="bg-gray-500 text-black p-2 rounded-xl mt-2">
                {{ $t("report.previous_period") }}
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
export default {
  data () {
    return {
      date: '',
      contactValues: [],
      stats: [],
      months: [],
      allContact: [
        {
          color: 'red',
          name: 'Gym access unique​'
        },
        {
          color: 'red',
          name: 'Gym access total​'
        },
        {
          color: 'blue',
          name: 'Room NY access'
        },
        {
          color: 'yellow',
          name: 'Hair dryer access​'
        },
        {
          color: 'orange',
          name: 'Room Tokio access​​'
        }
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
            data: [
              'Jan-21',
              'Feb-21',
              'Mar-21',
              'Apr-21',
              'May-21',
              'Jun-21',
              'Jul-21'
            ]
          },
          {
            type: 'category',
            position: 'bottom',
            show: false,
            axisLabel: {
              color: 'white'
            },
            data: [
              'Jan-21',
              'Feb-21',
              'Mar-21',
              'Apr-21',
              'May-21',
              'Jun-21',
              'Jul-21'
            ]
          },
          {
            type: 'category',
            position: 'bottom',
            show: false,
            axisLabel: {
              color: 'white'
            },
            data: [
              'Jan-21',
              'Feb-21',
              'Mar-21',
              'Apr-21',
              'May-21',
              'Jun-21',
              'Jul-21'
            ]
          }
        ],
        yAxis: [
          {
            type: 'value',

            splitLine: {
              lineStyle: {
                color: 'gray',
                type: 'dashed'
              },
              show: false
            },
            interval: 20,
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
            'Active Contacts',
            'Active Contacts on previous',
            'Budget active contacts'
          ],
          bottom: 0,
          itemGap: 20,
          textStyle: {
            color: 'white',
            fontSize: '18'
          },
          z: 10
        },
        series: [
          {
            data: [85, 100, 10, 90, 30, 45, 110],
            type: 'bar',
            stack: 'budget',
            xAxisIndex: 0,
            barWidth: '70%',
            itemStyle: {
              color: 'transparent'
            }
          },
          {
            data: [5, 5, 5, 5, 5, 5, 5],
            type: 'bar',
            name: 'Budget active contacts',
            stack: 'budget',
            barWidth: '70%',
            xAxisIndex: 0,
            itemStyle: {
              color: 'transparent',
              borderType: 'dotted',
              borderColor: 'red',
              borderWidth: 1.5
            },
            labelLine: {
              lineStyle: {
                type: 'dotted'
              }
            }
          },
          {
            data: [55, 67, 58, 39, 60, 74, 63],
            type: 'bar',
            xAxisIndex: 1,
            name: 'Active Contacts',
            barWidth: '50%',
            itemStyle: {
              color: 'red'
            }
          },
          {
            data: [90, 45, 35, 40, 70, 110, 130],
            type: 'bar',
            xAxisIndex: 2,
            barWidth: '30%',
            name: 'Active Contacts on previous',
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
            }
          }
        ]
      }
    }
  },
  async mounted () {
    // this.months = await this.$repos.statRepo.getContactsMonth();
    this.months = [
      { year: 2021, month: 3 },
      { year: 2021, month: 2 },
      { year: 2021, month: 1 },
      { year: 2020, month: 12 }
    ]
    await this.getStats([
      { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
    ])
  },
  methods: {
    async getStats (payload) {
      this.stats = await this.$repos.statRepo.getContactsStats({
        periods: payload
      })
    },
    getValues (value) {
      this.contactValues = value
    },
    async resetContactMonths () {
      // console.log(this.contactValues)
      await this.getStats(this.contactValues)
      this.$refs.monthModal.hide()
    }
  }
}
</script>
