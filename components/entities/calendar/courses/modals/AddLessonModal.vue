<template>
  <base-modal
    ref="baseModal"
    :title="$t('calendar.lesson_modal.title')"
    :disabled="!draft.entries.length"
    @shown="onShown"
    @dismiss="onDismiss"
    @hidden="onHidden"
    @done="save"
  >
    <base-form @submit.prevent>
      <base-progressive-fields-container :fields="fields" :data="draft" :show-all-fields="showAllFields">
        <template #location="{ inputAttrs }">
          <base-select
            v-model="draft.location"
            :items="locations"
            v-bind="inputAttrs"
            hide-selected
            @search="onLocationSearch"
            @item-select="onLocationSelect"
            @item-deselect="onLocationDeselect"
            @input="generateLessonEntries"
          >
            <template #selected-item-text="{ item }">
              <div v-if="item" class="flex items-center cursor-pointer" @dblclick="showLocationCapacityPopup(item.value)">
                <span>{{ item.text }}</span>
                <base-icon name="person" size="12" class="flex-shrink-0 ml-1" />
                <span class="ml-1">{{ item.value.capacity || 0 }}</span>
              </div>
            </template>
          </base-select>
        </template>

        <template #time="{ inputAttrs }">
          <cw-input-lesson-timing
            :start.sync="draft.time.start"
            :end.sync="draft.time.end"
            :sanification.sync="draft.sanificationTime"
            v-bind="inputAttrs"
            @validated="generateLessonEntries"
          />
        </template>

        <template #recurrence="{ inputAttrs }">
          <cw-input-lesson-recurrence
            :period.sync="draft.period"
            :recurrence.sync="draft.recurrence"
            :day-of-week.sync="draft.dayOfWeek"
            v-bind="inputAttrs"
            @change="generateLessonEntries"
          />
        </template>

        <template #datetime="{ inputAttrs}">
          <cw-input-lesson-period-range
            :start.sync="draft.datetime.start"
            :end.sync="draft.datetime.end"
            :end-after.sync="draft.datetime.endAfter"
            :end-type.sync="endType"
            v-bind="inputAttrs"
            @validated="generateLessonEntries"
          />
        </template>

        <template #trainers="{ inputAttrs }">
          <cw-input-trainer :disabled="!!draft.entries.length" v-bind="inputAttrs" />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <div class="space-y-4 mt-8">
      <cw-lesson-entry-swipe-card v-for="(entry, i) in draft.entries" :key="i" :entry="entry" @edit="showCalendarManagerModal(entry)" @remove="removeEntry(i)" />
    </div>

    <cw-location-capacity-popup ref="locationCapacityPopup" />
    <cw-calendar-manager-modal ref="calendarManagerModal" />
  </base-modal>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import GoogleMapsMixin from '@/mixins/GoogleMapsMixin'
import { parseTimeString } from '@/components/entities/calendar/utils'
import { courseDraftObservable, lessonDraftObservable } from '../shared'

export default {
  mixins: [GoogleMapsMixin],
  data () {
    return {
      lessonIndex: null,
      fields: [
        {
          name: 'location',
          label: this.$t('calendar.lesson_modal.location.label'),
          placeholder: this.$t('calendar.lesson_modal.location.placeholder'),
          tooltip: '',
          required: true
        },
        {
          name: 'time',
          startLabel: this.$t('global.start'),
          startPlaceholder: this.$t('calendar.lesson_modal.time.start.placeholder'),
          endLabel: this.$t('global.end'),
          endPlaceholder: this.$t('calendar.lesson_modal.time.end.placeholder'),
          durationLabel: this.$t('global.duration'),
          durationPlaceholder: this.$t('calendar.lesson_modal.time.duration.placeholder'),
          timingTooltip: this.$t('calendar.lesson_modal.time.tooltip'),
          sanificationLabel: this.$t('calendar.lesson_modal.sanification.label'),
          sanificationPlaceholder: this.$t('calendar.lesson_modal.sanification.placeholder'),
          sanificationTooltip: this.$t('calendar.lesson_modal.sanification.tooltip'),
          required: true,
          isEmpty: v => !!(!v.start || !v.end)
        },
        {
          name: 'recurrence',
          tooltip: this.$t('calendar.lesson_modal.recurrence.tooltip'),
          isEmpty: () => true
        },
        {
          name: 'datetime',
          tooltip: this.$t('calendar.lesson_modal.period.tooltip'),
          startLabel: this.$t('global.start'),
          startPlaceholder: this.$t('calendar.lesson_modal.period.start.placeholder'),
          endByRadioLabel: this.$t('calendar.lesson_modal.period.end_by_radio.label'),
          endByInputLabel: this.$t('global.end'),
          endByInputPlaceholder: this.$t('calendar.lesson_modal.period.end_by_input.placeholder'),
          endAfterRadioLabel: this.$t('calendar.lesson_modal.period.end_after_radio.label'),
          endAfterInputLabel: this.$t('global.lessons'),
          endAfterInputPlaceholder: this.$t('global.lessons'),
          required: true,
          isEmpty: v => !!(!v.start || !v.end)
        },
        {
          name: 'trainers',
          label: this.$t('calendar.lesson_modal.trainers.label')
        }
      ],
      draft: lessonDraftObservable,
      endType: 'end-by',
      rooms: [],
      addresses: [],
      hasUnsavedChanges: false
    }
  },
  computed: {
    ...mapState('calendar', ['gymAssets']),
    ...mapGetters('calendar', ['assetsById']),
    showAllFields () {
      return this.lessonIndex !== null && this.lessonIndex !== undefined
    },
    allRooms () {
      const maxAge = courseDraftObservable.age.max

      return this.gymAssets
        .map(({ _id, name, capacity }) => ({ text: name, value: { type: 'room', roomId: _id, capacity: maxAge > 12 ? capacity.adult : capacity.children } }))
    },
    selectedRoomIds () {
      const output = {}

      this.draft.location.filter(l => l.type === 'room').forEach((room) => {
        output[room.roomId] = true
      })

      return output
    },
    selectedAddressPlaceIds () {
      const output = {}

      this.draft.location.filter(l => l.type === 'address').forEach((location) => {
        output[location.address.placeId] = true
      })

      return output
    },
    locations () {
      return this.rooms.concat(this.addresses)
    },
    isFormValid () {
      const { location, time, datetime } = this.draft

      const isLocationsValid = !!location.length
      if (!isLocationsValid) {
        return false
      }

      const isTimebandValid = !!(time.start && time.end && parseTimeString(time.start) < parseTimeString(time.end))
      if (!isTimebandValid) {
        return false
      }

      const isPeriodValid = !!(datetime.start && ((this.endType === 'end-by' && datetime.end && datetime.start < datetime.end) || datetime.endAfter))
      if (!isPeriodValid) {
        return false
      }

      return true
    }
  },
  watch: {
    draft: {
      deep: true,
      handler () {
        this.hasUnsavedChanges = true
      }
    }
  },
  created () {
    this.debounce = this.$utils.createDebounce()

    this.initGoogleMap(() => {
      // eslint-disable-next-line no-undef
      this.autoCompleteService = new google.maps.places.AutocompleteService()
    })
  },
  methods: {
    show (lessonIndex) {
      if (lessonIndex !== null && lessonIndex !== undefined) {
        this.lessonIndex = lessonIndex
      }

      this.$refs.baseModal.show()
    },
    handlePlacePredictions (predictions, status) {
      // eslint-disable-next-line no-undef
      if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
        // console.warn('Google Maps PlacesServiceStatus', status)
        return
      }

      this.addresses = this.addresses.filter(({ value }) => value.address.placeId in this.selectedAddressPlaceIds)
        .concat(
          predictions
            .filter(p => !(p.place_id in this.selectedAddressPlaceIds))
            // eslint-disable-next-line camelcase
            .map(({ place_id, description }) => ({ text: description, value: { type: 'address', address: { placeId: place_id, loc: description }, capacity: null } })
            ))
    },
    onLocationSearch (v) {
      const searchText = v.toLowerCase()

      this.debounce(() => {
        const matchingRooms = JSON.parse(JSON.stringify(this.allRooms.filter(({ text }) => text.toLowerCase().includes(searchText))))
        this.rooms = this.rooms.filter(room => room.value.roomId in this.selectedRoomIds)
          .concat(
            matchingRooms.filter(r => !(r.value.roomId in this.selectedRoomIds))
          )
        this.autoCompleteService.getPlacePredictions({ input: searchText }, this.handlePlacePredictions)
      })
    },
    onLocationSelect (location) {
      this.addresses = this.addresses.filter(({ value }) => value.address.placeId in this.selectedAddressPlaceIds)

      if (location.value.type === 'address') {
        this.showLocationCapacityPopup(location.value)
      }

      this.onLocationSearch('')
    },
    onLocationDeselect (location) {
      if (location.type === 'address') {
        const index = this.addresses.findIndex(address => address.value === location)
        this.addresses.splice(index, 1)
      }
    },
    showLocationCapacityPopup (location) {
      this.$refs.locationCapacityPopup.show(location)
    },
    showCalendarManagerModal (entry) {
      const i = this.draft.entries.indexOf(entry)

      const saveAction = (draft) => {
        this.draft.entries.splice(i, 1, draft)
      }

      this.$refs.calendarManagerModal.show(entry, saveAction)
    },
    removeEntry (index) {
      this.draft.entries.splice(index, 1)
    },
    generateLessonEntries () {
      if (!this.isFormValid) {
        return
      }

      this.draft.entries = []

      const { location, time, period, recurrence, dayOfWeek, datetime } = this.draft
      const { start, end, endAfter } = datetime
      start.setHours(0, 0, 0, 0)
      end?.setHours(0, 0, 0, 0)

      function getEntry (entryDate) {
        const s = new Date(entryDate.getTime())
        const e = new Date(entryDate.getTime())

        let t = parseTimeString(time.start)
        s.setHours(Math.floor(t))
        s.setMinutes((t % 1) * 60)

        t = parseTimeString(time.end)
        e.setHours(Math.floor(t))
        e.setMinutes((t % 1) * 60)

        return {
          location: JSON.parse(JSON.stringify(location)),
          datetime: { start: s, end: e },
          trainers: []
        }
      }

      let d; let i = 0

      if (period === 'week') {
        const sortedDayOfWeek = dayOfWeek.slice().sort((a, b) => a - b)

        const lessonFirstWeekStart = new Date()
        lessonFirstWeekStart.setHours(0, 0, 0, 0)
        lessonFirstWeekStart.setDate(start.getDate() - start.getDay())

        let currentWeekStart = d = new Date(lessonFirstWeekStart.getTime())

        if (this.endType === 'end-by') {
          while (d < end) {
            currentWeekStart = new Date(lessonFirstWeekStart.getTime())
            currentWeekStart.setDate(lessonFirstWeekStart.getDate() + (7 * recurrence) * i++)

            for (const j of sortedDayOfWeek) {
              d = new Date(currentWeekStart.getTime())
              d.setDate(currentWeekStart.getDate() + j)

              if (d >= start && d <= end) {
                this.draft.entries.push(getEntry(d))
              }
            }
          }
          datetime.endAfter = this.draft.entries.length
        } else {
          while (this.draft.entries.length < endAfter) {
            currentWeekStart.setDate(lessonFirstWeekStart.getDate() + (7 * recurrence) * i++)

            for (const j of sortedDayOfWeek) {
              d = new Date(currentWeekStart.getTime())
              d.setDate(currentWeekStart.getDate() + j)

              if (this.draft.entries.length < endAfter) {
                this.draft.entries.push(getEntry(d))
              } else {
                break
              }
            }
          }
          datetime.end = d
        }
      } else {
        d = start

        if (this.endType === 'end-by') {
          while (d <= end) {
            d = new Date(start.getTime())
            d.setDate(start.getDate() + recurrence * i++)
            if (d <= end) {
              this.draft.entries.push(getEntry(d))
            }
          }
          datetime.endAfter = this.draft.entries.length
        } else {
          while (this.draft.entries.length < endAfter) {
            d = new Date()
            d.setDate(start.getDate() + recurrence * i++)
            this.draft.entries.push(getEntry(d))
          }
          datetime.end = d
        }
      }
    },
    onShown () {
      if (this.lessonIndex !== null && this.lessonIndex !== undefined) {
        // Pre-fill locations. We need the same object references for base-select to work
        const lesson = courseDraftObservable.lessons[this.lessonIndex]
        const location = lesson.location

        const l = location.length
        for (let i = 0; i < l; i++) {
          if (location[i].type === 'room') {
            this.rooms.push({ text: this.assetsById[location[i].roomId].name, value: location[i] })
          } else {
            this.addresses.push({ text: location[i].address.loc, value: location[i] })
          }
        }

        Object.assign(this.draft, lesson)
      }

      // Populate menu with rooms initially
      this.onLocationSearch('')
    },
    onDismiss () {
      if (this.hasUnsavedChanges) {
        this.$confirm(this.$t('calendar.course_modal.confirm_exit'), () => {
          this.$refs.baseModal.hide()
        })
      } else {
        this.$refs.baseModal.hide()
      }
    },
    onHidden () {
      this.draft.reset()
      Object.assign(this.$data, this.$options.data.call(this))
    },
    save () {
      const draft = this.$utils.clone(this.draft)
      if (this.lessonIndex !== null && this.lessonIndex !== undefined) {
        courseDraftObservable.lessons.splice(this.lessonIndex, 1, draft)
      } else {
        courseDraftObservable.lessons.push(draft)
      }

      this.$refs.baseModal.hide()
    }
  }
}
</script>
