<template>
  <base-main-card
    v-bind="$attrs"
    :title="$t('profile.entities.performance')"
    show-search-toggler
    :hide-search="true"
    :actions="[{ icon: 'add', handler: showModal }]"
    body-class="bg-white p-4"
    v-on="$listeners"
  >
    <cw-user-performance-modal
      ref="modal"
      :last-height="lastHeight"
      @bioCreated="getBio(profile._id)"
    />

    <cw-profile-completion-modal
      v-bind="{ ref: 'completionModal', skipInitialCheck: true }"
      @done="getProfile(profile._id)"
    />

    <base-tabs
      v-model="activeTab"
      class="text-sm font-bold"
      v-bind="{ tabs, property: 'name', name: 'title' }"
    />
    <div class="grid grid-cols-3 mt-4 mb-6 gap-2">
      <div
        class="flex items-center justify-center border-r border-gray-400 text-sm"
      >
        <div v-if="lastHeight" class="flex flex-col items-center">
          <b
            class="font-extrabold text-lg"
          >{{ lastHeight }} {{ lengthFormat }}</b>
          <span class="uppercase text-2xs text-gray-600">
            {{ $t('performance.body_height.label') }}
          </span>
        </div>
        <button
          v-else
          class="underline text-blue cursor-pointer"
          @click="showModal"
        >
          {{ $t('performance.body_height.label') }}?
        </button>
      </div>
      <div
        class="flex items-center justify-center border-r border-gray-400 text-sm"
      >
        <div v-if="profile && profile.dob" class="flex flex-col items-center">
          <b class="font-extrabold text-lg">{{ $utils.getAge(profile.dob) }}</b>
          <span class="uppercase text-2xs text-gray-600">
            {{ $t('performance.age') }}
          </span>
        </div>
        <button
          v-else
          class="underline text-blue cursor-pointer"
          @click.prevent="showCompletionModal"
        >
          {{ $t('performance.age') }}?
        </button>
      </div>
      <div class="text-sm text-center">
        <div
          v-if="profile && profile.gender"
          class="flex flex-col items-center"
        >
          <b class="font-extrabold text-lg">{{
            profile.gender == 'male' ? 'M' : 'F'
          }}</b>
          <span class="uppercase text-2xs text-gray-600">{{
            $t('performance.gender')
          }}</span>
        </div>
        <button
          v-else
          class="underline text-blue"
          @click.prevent="showCompletionModal"
        >
          {{ $t('performance.gender') }}?
        </button>
      </div>
    </div>
    <div v-if="getSortedBio && getSortedBio.length">
      <base-graph :options="graphData" class="" style="height: 300px" />
    </div>
    <div v-else class="flex flex-col justify-center items-center mt-10">
      <base-icon name="performance-empty" size="220" class="text-gray-500" />
      <button class="text-gray-600 cursor-pointer text-sm" @click="showModal">
        {{ $t('profile.performance.empty_detail') }}
      </button>
    </div>
    <div v-if="getSortedBio && getSortedBio.length" class="mt-2">
      <p class="font-bold">
        {{ $t('performance.progress') }}
      </p>
      <base-swipe-card
        v-for="(item, index) in getSortedBio"
        :key="index"
        bg-color="#ffffff"
        body-class=" text-black -m-1 pr-5"
        class="relative shadow-cw-card mt-2"
        horizontal-actions
        style="min-height: 0 !important"
        toggler-class="text-gray-500"
        :actions="[
          { icon: 'pen', handler: () => editCurrentBio(item) },
          {
            icon: 'bin',
            danger: true,
            handler: () => deleteCurrentBio(item._id)
          }
        ]"
      >
        <div class="flex h-full flex-col">
          <div class="flex justify-between w-full">
            <div class="text-sm font-bold">
              {{ $dayjs(item.measuredAt).format('ddd, D MMMM YYYY') }}
            </div>
            <div class="flex pr-3">
              <base-icon
                v-if="
                  getSortedBio[index + 1] &&
                    Number(getSortedBio[index + 1].body.weight) !==
                    Number(getSortedBio[index].body.weight)
                "
                :name="formatIcon(index)"
                size="14"
                class="mt-1"
              />
              <p class="ml-3 text-sm font-bold">
                {{ item.body && formatWeight(item.body.weight) }}
              </p>
            </div>
          </div>
          <p class="text-left text-xs" v-html="formatInfoInCard(item)" />
        </div>
      </base-swipe-card>
    </div>
  </base-main-card>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import _ from 'lodash'
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data () {
    return {
      tabs: [
        { title: 'Bio', name: 'bio' },
        { title: 'Activities', name: 'activities' }
      ],
      activeTab: 'bio'
    }
  },
  computed: {
    ...mapGetters('profile', ['getSortedBio']),

    getSortedBioReverse () {
      return [...this.getSortedBio].reverse()
    },
    lastHeight () {
      if (this.getSortedBio.length && this.getSortedBio[0].body.height) {
        return this.getSortedBio[0].body.height
      }
      return 0
    },

    weightFormat () {
      return this.$auth.user.settings.weightFormat || 'kg'
    },

    lengthFormat () {
      return this.$auth.user.settings.lengthFormat || 'cm'
    },

    numberFormat () {
      return this.$auth.user.settings.numberFormat
    },

    graphData () {
      return {
        grid: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 80
        },
        tooltip: {
          trigger: 'item'
        },
        xAxis: {
          axisLabel: {
            rotate: 45,
            textStyle: {
              color: 'black'
            }
          },
          // axisTick: {
          //   show: true,
          //   color: 'gray',
          //   alignWithLabel: true
          // },
          // axisLine: {
          //   show: true,
          //   color: 'gray'
          // },
          data: this.graphDate
        },
        yAxis: [
          {
            position: 'left',
            type: 'value',
            name: this.$t('performance.body_weight'),
            min: _.min(this.graphWeight) - 10,
            max: _.ceil(_.max(this.graphWeight) * 2, -1) / 2,
            show: false
          },
          {
            position: 'right',
            type: 'value',
            name: 'BMI',
            show: true,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            min: _.min(this.graphBmi) - 3,
            max: _.max(this.graphBmi) + 3
          }
        ],

        // }
        dataZoom: [
          {
            type: 'slider',
            start: 100 - (9 / this.graphDate.length) * 100,
            end: 100,
            zoomLock: true,
            zoomOnMouseWheel: false,
            brushSelect: false,
            show: this.graphDate.length > 8
          }
        ],
        series: [
          {
            type: 'bar',
            showBackground: false,
            data: this.graphWeight,
            barWidth: 20,
            name: this.$t('performance.body_weight'),
            yAxisIndex: 0,
            label: {
              show: true,
              position: 'top'
            },
            tooltip: {
              formatter: (params) => {
                const item = this.getSortedBioReverse[params.dataIndex]
                const ret = []
                ret.push('<b>' + params.name + '</b>')
                if (item.bmi) {
                  ret.push(`${this.$t('performance.bmi')}:  ${item.bmi}`)
                }
                if (item.body.height) {
                  ret.push(
                    `${this.$t(
                      'performance.body_height.label'
                    )}:  ${this.$utils.convertMeasurement(
                      item.body.height,
                      this.lengthFormat,
                      'cm'
                    )}
                      ${this.lengthFormat}`
                  )
                }
                if (item.body.weight) {
                  ret.push(
                    `${this.$t(
                      'performance.body_weight.label'
                    )} ${this.formatWeight(item.body.weight)}`
                  )
                }
                if (item && item.body && item.body.mass) {
                  if (item.body.mass.muscle) {
                    ret.push(
                      `${this.$t(
                        'performance.muscle.abbr'
                      )} ${this.formatWeight(item.body.mass.muscle)}`
                    )
                  }
                  if (item.body.mass.fat) {
                    ret.push(
                      `${this.$t('performance.fat.abbr')} ${this.formatWeight(
                        item.body.mass.fat
                      )}`
                    )
                  }

                  if (item.body.mass.tissue) {
                    ret.push(
                      `${this.$t(
                        'performance.tissue.abbr'
                      )} ${this.formatWeight(item.body.mass.tissue)}`
                    )
                  }

                  if (item.body.mass.bone) {
                    ret.push(
                      `${this.$t('performance.bone.abbr')} ${this.formatWeight(
                        item.body.mass.bone
                      )}`
                    )
                  }

                  if (item.body.water) {
                    ret.push('H<sub>2</sub>0: ' + item.body.water + ' %')
                  }
                }
                return ret.join(' <br> ')
              }
            }
          },
          {
            type: 'line',
            data: this.graphBmi,
            name: 'BMI',
            yAxisIndex: 1,
            label: {
              show: false,
              position: 'top'
            }
          }
        ]
      }
    },
    graphDate () {
      return this.getSortedBioReverse?.map((item) => {
        return this.$dayjs(item.measuredAt).format('DD-MMM')
      })
    },
    graphWeight () {
      return this.getSortedBioReverse?.map((item) => {
        return item?.body?.weight
      })
    },
    graphBmi () {
      return this.getSortedBioReverse?.map((item) => {
        return item?.bmi
      })
    }
  },
  methods: {
    ...mapActions('profile', ['getBio', 'getProfile']),
    showCompletionModal () {
      this.$refs?.completionModal?.show(this.profile._id)
    },
    showModal () {
      this.$refs?.modal?.show(this.profile._id)
    },
    editCurrentBio (currentBio) {
      this.$refs?.modal?.show(this.profile._id, currentBio)
    },
    deleteCurrentBio (id) {
      this.$repos.profileRepo.bio
        .delete({ id, profileId: this.profile._id })
        .then((res) => {
          if (res) {
            this.getBio(this.profile._id)
          }
        })
    },
    formatIcon (index) {
      if (
        Number(this.getSortedBio[index]?.body?.weight) <
        Number(this.getSortedBio[index + 1]?.body?.weight)
      ) {
        return 'arrow-down'
      } else {
        return 'arrow-up'
      }
    },
    formatWeight (w) {
      return (
        this.$utils.formatMeasurement(
          w,
          this.weightFormat,
          'kg',
          this.numberFormat
        ) +
        ' ' +
        this.weightFormat
      )
    },
    formatInfoInCard (item) {
      const ret = []
      if (item.bmi) {
        ret.push('BMI ' + item.bmi)
      }
      if (item && item.body && item.body.mass) {
        if (item.body.mass.muscle) {
          ret.push(
            `${this.$t('performance.muscle.abbr')} ${this.formatWeight(
              item.body.mass.muscle
            )}`
          )
        }
        if (item.body.mass.fat) {
          ret.push(
            `${this.$t('performance.fat.abbr')} ${this.formatWeight(
              item.body.mass.fat
            )}`
          )
        }

        if (item.body.mass.tissue) {
          ret.push(
            `${this.$t('performance.tissue.abbr')} ${this.formatWeight(
              item.body.mass.tissue
            )}`
          )
        }

        if (item.body.mass.bone) {
          ret.push(
            `${this.$t('performance.bone.abbr')} ${this.formatWeight(
              item.body.mass.bone
            )}`
          )
        }

        if (item.body.water) {
          ret.push('H<sub>2</sub>0 ' + item.body.water + ' %')
        }
      }
      return ret.join(' <span class="text-gray-500">|</span> ') || '&nbsp'
    }
  }
}
</script>
<style scoped>
.border-left::after {
  content: '';
  border-right: 1px solid gray;
}
</style>
