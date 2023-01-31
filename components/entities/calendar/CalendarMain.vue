<template>
  <base-main-card v-bind="{ footerBackground: 'transparent' }">
    <template #header>
      <div class="flex flex-col min-w-full">
        <div
          class="flex items-center min-w-full pb-2 border-b border-gray-400 space-x-3"
          :class="[
            isSearchBoxOpen
              ? 'justify-end sm:justify-between'
              : 'justify-between',
          ]"
        >
          <div
            class="flex items-center"
            :class="[isSearchBoxOpen ? 'hidden sm:flex' : 'flex']"
          >
            <slot name="switcher" />
            <button
              class="font-bold ml-4 whitespace-nowrap"
              @click="showMonthPickerModal"
            >
              {{ month }}
            </button>

            <button class="ml-4 hidden sm:inline-block" @click="dateShift--">
              <base-icon name="chevron-left" />
            </button>
            <button class="ml-2 hidden sm:inline-block" @click="dateShift++">
              <base-icon name="chevron-right" />
            </button>
            <button @click="dateShift = 0">
              <base-icon name="calendar-today" class="ml-4" />
            </button>
          </div>

          <div class="flex items-center">
            <base-advanced-filter
              v-model="filters"
              class="searchbox w-full"
              :class="isSearchBoxOpen ? 'flex' : 'hidden xl:flex'"
              sync-with-route
              :selects-option="[
                {
                  attr: 'timeBands',
                  items: timeBands,
                  itemText: (item) => [item.start, item.end].join(' '),
                  itemValue: 'id',
                  label: 'Time band',
                  tooltip: 'Select time band',
                },
                {
                  attr: 'activities',
                  items: [],
                  itemText: (item) => item.name,
                  label: 'Activity',
                  tooltip: 'Select activity',
                },
                {
                  attr: 'trainers',
                  items: [],
                  label: 'Trainer / Atheletes',
                  tooltip: 'Select trainer or atheletes',
                },
                {
                  attr: 'rooms',
                  items: [],
                  label: 'Room',
                  tooltip: 'Select room',
                },
                {
                  attr: 'sportInterests',
                  items: [],
                  label: 'Sport interest',
                  tooltip: 'Select sport interest',
                },
              ]"
            >
              <template #prefix>
                <button class="text-gray-500" @click.stop>
                  <base-icon name="printer" size="20" />
                </button>
              </template>
              <template #select:activities:after>
                <base-switcher
                  :value="true"
                  true-text="Visible"
                  false-text="Invisible"
                  light
                  class="-mb-3 ml-2"
                  style="grid-column: 4; grid-row: 1; align-self: end"
                />
              </template>
            </base-advanced-filter>

            <div
              class="flex lg:hidden justify-center items-center h-full mx-4"
              style="color: darkgrey"
            >
              <transition
                :enter-class="
                  isSearchBoxOpen
                    ? 'opacity-0 rotate-90'
                    : 'opacity-0 -rotate-90'
                "
                :leave-to-class="
                  isSearchBoxOpen
                    ? 'opacity-0 -rotate-90'
                    : 'opacity-0 rotate-90'
                "
                enter-active-class="transform transition duration-150"
                leave-active-class="transform transition duration-150"
              >
                <button
                  v-if="isSearchBoxOpen"
                  key="dismiss"
                  class="w-full h-full"
                  @click="isSearchBoxOpen = false"
                >
                  <base-icon name="dismiss" :size="16" />
                </button>
                <button
                  v-else
                  key="search"
                  class="w-full h-full"
                  @click="isSearchBoxOpen = true"
                >
                  <base-icon name="search" :size="20" />
                </button>
              </transition>
            </div>

            <div
              class="hidden xl:flex justify-between space-x-3 lg:ml-3"
              :class="{ 'max-h-14': !isSmallScreen || isSearchBoxOpen }"
            >
              <label
                v-for="(timeBand, i) in timeBands"
                :key="i"
                class="time-band"
                :class="{ selected: filters.timeBands.includes(timeBand.id) }"
              >
                <input
                  v-model="filters.timeBands"
                  type="checkbox"
                  :value="timeBand.id"
                >
                <span>{{ timeBand.start }}</span>
                <span>{{ timeBand.end }}</span>
              </label>
            </div>

            <button class="lg:ml-4">
              <base-icon
                name="add"
                @click="$refs.courseOrRentableModal.show()"
              />
            </button>

            <!-- <base-popover
              :offset-y="20"
              :class="[isSearchBoxOpen ? 'hidden sm:flex' : 'flex']"
            >
              <template #activator>
                <button class="lg:ml-4">
                  <base-icon name="add" />
                </button>
              </template>

              <div
                class="flex flex-col bg-white bg-opacity-90 w-56 rounded px-0 py-1"
              >
                <cw-calendar-burger-menu-option icon="calendar">
                  My Calendar
                </cw-calendar-burger-menu-option>
                <cw-calendar-burger-menu-option icon="battery">
                  Free time slots
                </cw-calendar-burger-menu-option>
                <cw-calendar-burger-menu-option icon="printer">
                  Print
                </cw-calendar-burger-menu-option>
                <cw-calendar-burger-menu-option
                  v-if="$auth.isBusiness()"
                  icon="add"
                  @click="showRentableModal"
                >
                  Add Rentable
                </cw-calendar-burger-menu-option>
                <cw-calendar-burger-menu-option
                  icon="add"
                  @click="showCourseModal"
                >
                  Add course
                </cw-calendar-burger-menu-option>
                <cw-calendar-burger-menu-option icon="add">
                  Add appointment
                </cw-calendar-burger-menu-option>
                <cw-calendar-burger-menu-option icon="calendar">
                  GYM 2
                </cw-calendar-burger-menu-option>
              </div>
            </base-popover> -->
          </div>
        </div>
        <!-- <hr class="w-full -mx-10 text-black border-gray-700"> -->
        <cw-calendar-mobile-date-selector
          v-model="selectedDate"
          class="sm:hidden mt-2"
          v-bind="{ baseDate, dateShift }"
          @change-month="changeMonth"
        />
        <cw-calendar-date-selector
          v-model="selectedDate"
          class="hidden sm:grid mt-2"
          style="border-top: 1px solid lightgray"
          v-bind="{ baseDate, dateShift }"
          @change-month="changeMonth"
          @change-dates="changeDates"
        />
      </div>
    </template>

    <template #default>
      <slot v-bind="{ dates }" />
      <cw-month-picker-modal
        ref="monthPickerModal"
        @selected="onMonthSelected"
      />
      <cw-course-or-rentable-modal ref="courseOrRentableModal" />
    </template>
    <template #footer>
      <div
        class="flex justify-between items-center max-w-4xl xl:max-w-6xl px-2 sm:px-6 lg:mx-auto w-full"
      >
        <div class="flex">
          <label
            v-if="$auth.user.typeCode === 'TU'"
            class="bg-gray-150 h-8 flex items-center px-3 rounded-t-md"
          >{{ $auth.user.firstname }}
            {{ $auth.user.lastname && $auth.user.lastname.substr(0, 1) + "." }}
            <input
              v-model="filters.trainers"
              type="checkbox"
              :value="$auth.user._id"
            ></label>
        </div>
        <div class="flex capitalize space-x-3">
          <label
            v-for="activity in activities"
            :key="activity._id"
            class="bg-gray-150 h-8 flex items-center px-3 rounded-t-md text-sm cursor-pointer border-gray-150 border-4 border-b-0"
            :class="{ selected: filters.activities.includes(activity._id) }"
          >{{ activity.name }}
            <input
              v-model="filters.activities"
              type="checkbox"
              :value="activity._id"
            ></label>
        </div>
      </div>
    </template>
  </base-main-card>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  data () {
    const lang = this.$route.query.language
    const locale = lang === 'en' || lang === 'it' ? lang : 'en'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return {
      timeBands: [
        { start: '7:00', end: '12:00', id: '1' },
        { start: '12:00', end: '14:00', id: '2' },
        { start: '14:00', end: '18:00', id: '3' },
        { start: '18:00', end: '22:00', id: '4' },
        { start: '22:00', end: '7:00', id: '5' }
      ],
      locale,
      baseDate: today,
      dates: [],
      dateShift: 0,
      month: today.toLocaleDateString(locale, {
        month: 'short',
        year: 'numeric'
      }),
      isSearchBoxOpen: false,

      filters: {
        text: '',
        timeBands: ['1', '2'],
        activities: [],
        trainers: [],
        rooms: [],
        sportInterests: []
      }
    }
  },
  computed: {
    ...mapState('calendar', ['activities']),
    selectedDate: {
      get () {
        return this.$store.state.calendar.selectedDate
      },
      set (v) {
        this.setDate(v)
      }
    },
    isSmallScreen () {
      return ['mobile', 'tablet'].includes(this.$mq)
    },
    isAllBandsSelected: {
      get () {
        return this.filters.timeBands.length === this.timeBands.length
      },
      set (value) {
        if (value) {
          this.filters.timeBands = this.timeBands.map(t => t.id)
        } else {
          this.filters.timeBands = []
        }
      }
    }
  },
  watch: {
    baseDate () {
      this.dateShift = 0
    }
  },
  mounted () {
    if (window.innerWidth > 1024) {
      this.isSearchBoxOpen = true
    }
  },
  methods: {
    ...mapMutations('calendar', {
      setDate: 'SET_DATE'
    }),
    showMonthPickerModal () {
      this.$refs.monthPickerModal?.show()
    },
    changeDates (dates) {
      this.dates = dates
    },
    /**
     * @param {Date} date
     */
    changeMonth (date) {
      this.month = date.toLocaleDateString(this.locale, {
        month: 'short',
        year: 'numeric'
      })
    },
    /**
     * @param {Date} date
     */
    onMonthSelected (date) {
      date.setHours(0, 0, 0, 0)
      this.baseDate = date
      this.changeMonth(date)
    },

    selectTimeband (timeBand) {
      const i = this.filters.timeBands.indexOf(timeBand.id)
      if (i === -1) {
        this.filters.timeBands.push(timeBand.id)
      } else {
        this.filters.timeBands.splice(i, 1)
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
::v-deep button:focus {
  @apply outline-none;
}

input[type="checkbox"],
::v-deep input[type="radio"] {
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
  @apply absolute w-0 h-0 overflow-hidden;
}

::v-deep .base-card__header {
  height: auto !important;
}

.searchbox {
  transition: width 300ms, padding 300ms;

  & ::v-deep input {
    @apply text-lg !important;
  }
}

.collapsed {
  @apply w-0 px-0;
}

.time-band {
  @apply flex flex-col justify-center items-center bg-white w-12 h-12 text-xs rounded-md cursor-pointer transition-colors duration-100 px-4;

  @screen sm {
    @apply w-14 h-14;
  }
}

::v-deep .selected {
  @apply bg-cw-red text-white !important;
}
</style>
