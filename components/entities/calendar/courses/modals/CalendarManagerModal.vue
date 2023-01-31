<template>
  <base-modal
    ref="baseModal"
    class="calendar-manager-modal"
    content-class="calendar-manager-content-class"
    body-class="calendar-manager-body-class"
    :perfect-scrollbar-options="{ suppressScrollY: true }"
    :title="title"
    @shown="onShown"
    @dismiss="onDismiss"
    @hidden="onHidden"
    @done="save"
  >
    <div class="bg-gray-150 text-black p-3">
      <div class="text-right font-semibold">
        {{ month }}
      </div>

      <div class="flex items-center mt-2 ml-7">
        <div>
          <cw-calendar-manager-date-selector class="pointer-events-none" :value="selectedDate" />
        </div>
        <div class="flex items-center flex-1 ml-4">
          <button @click="dateShift--">
            <base-icon name="chevron-left" />
          </button>
          <div class="w-full flex justify-between items-center">
            <cw-calendar-manager-date-selector
              v-for="(date, i) in dates"
              :key="i"
              v-model="selectedDate"
              :class="{ available: true }"
              :value="date"
            />
          </div>
          <button @click="dateShift++">
            <base-icon name="chevron-right" />
          </button>
        </div>
      </div>

      <div v-if="showTrainersRow" class="flex items-center mt-2">
        <button class="mr-3" @click="showAddTrainersPopup">
          <base-icon name="add" />
        </button>
        <div class="flex-1 flex items-center min-w-0">
          <div class="flex items-center space-x-1">
            <div v-for="({ trainerId }, i) in draft.trainers" :key="trainerId" class="relative group">
              <cw-calendar-manager-generic-selector
                :checked="i === editTrainerIndex"
                @click.native="editTrainerIndex = i"
              >
                {{ trainersById[trainerId].displayName }}
              </cw-calendar-manager-generic-selector>
              <button
                v-show="draft.trainers.length > 1"
                class="hidden absolute top-0 right-0 justify-center items-center h-full rounded-r-md bg-black bg-opacity-25 text-white group-hover:flex"
                @click="removeTrainer(i)"
              >
                <base-icon name="bin" />
              </button>
            </div>
          </div>
          <div class="flex items-center flex-1 min-w-0 ml-2">
            <button @click="shiftTrainersLeft">
              <base-icon name="chevron-left" />
            </button>
            <div ref="trainers" class="flex space-x-1 flex-1 overflow-x-scroll scrollbar-hidden">
              <cw-calendar-manager-generic-selector
                v-for="trainer in trainers"
                :key="trainer._id"
                :model-value="trainerBeingEdited.roomId"
                class="flex-shrink-0"
                :value="trainer._id"
                :class="{ available: true }"
                @change="selectTrainer"
              >
                {{ trainer.displayName }}
              </cw-calendar-manager-generic-selector>
            </div>
            <button @click="shiftTrainersRight">
              <base-icon name="chevron-right" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="draft" class="flex items-center mt-1">
        <button class="mr-3" @click="showAddRoomsPopup">
          <base-icon name="add" />
        </button>
        <div class="flex-1 flex items-center min-w-0 pt-1 border-t border-black border-opacity-25">
          <div class="flex items-center space-x-1">
            <div v-for="({ roomId, address }, i) in draft.location" :key="roomId || address.placeId" class="relative group">
              <cw-calendar-manager-generic-selector
                :checked="i === editLocationIndex"
                @click.native="editLocationIndex = i"
              >
                {{ assetsById[roomId] ? assetsById[roomId].name : address.loc }}
              </cw-calendar-manager-generic-selector>
              <button
                v-show="draft.location.length > 1"
                class="hidden absolute top-0 right-0 justify-center items-center h-full rounded-r-md bg-black bg-opacity-25 text-white group-hover:flex"
                @click="removeLocation(i)"
              >
                <base-icon name="bin" />
              </button>
            </div>
          </div>
          <div class="flex items-center flex-1 min-w-0 ml-2">
            <button @click="shiftRoomsLeft">
              <base-icon name="chevron-left" />
            </button>
            <div ref="rooms" class="flex space-x-1 flex-1 overflow-x-scroll scrollbar-hidden">
              <cw-calendar-manager-generic-selector
                v-for="room in gymAssets"
                :key="room._id"
                :model-value="locationBeingEdited.roomId"
                class="flex-shrink-0"
                :value="room._id"
                :class="{ available: true }"
                @change="selectLocation"
              >
                {{ room.name }}
              </cw-calendar-manager-generic-selector>
            </div>
            <button @click="shiftRoomsRight">
              <base-icon name="chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <base-scroll style="height: calc(100% - 160px)">
      <div ref="hours" class="hours" @click.self="createTimeband">
        <div class="absolute inset-0 pointer-events-none" style="margin-left: 38px; bottom: 48px">
          <div
            v-show="draft"
            ref="timeband"
            class="flex flex-col justify-center w-full bg-white text-black py-1 px-3 rounded-lg pointer-events-auto"
          >
            <div class="font-semibold">
              {{ courseName }}
            </div>
            <div class="flex justify-between leading-tight">
              <span class="font-semibold text-gray-600">
                {{ locationBeingEdited && (assetsById[locationBeingEdited.roomId] ? assetsById[locationBeingEdited.roomId].name : locationBeingEdited.address.loc) }}
              </span>
              <button class="flex items-center px-1 border border-black border-opacity-50 rounded-md">
                <base-icon name="person" size="12" />
                <span class="text-xs ml-2" @dblclick="showLocationCapacityPopup(locationBeingEdited)">{{ locationBeingEdited && locationBeingEdited.capacity }}</span>
              </button>
            </div>
            <!-- <button @click="removeTimeband">
              <base-icon name="bin" />
            </button> -->
          </div>
        </div>
        <div v-for="n in 25" :key="n" class="hour" />
      </div>
    </base-scroll>

    <cw-add-rooms-popup ref="addRoomsPopup" @add="addRooms" />
    <cw-add-trainers-popup ref="addTrainersPopup" @add="addTrainers" />
    <cw-location-capacity-popup ref="locationCapacityPopup" />
  </base-modal>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import interact from 'interactjs'
import { courseDraftObservable, lessonDraftObservable } from '../shared'

export default {
  data: () => ({
    draft: null,
    dateShift: 0,
    baseDate: null,
    editLocationIndex: 0,
    editTrainerIndex: 0,
    hourHeight: null,
    hasUnsavedChanges: false
  }),
  computed: {
    ...mapState('calendar', ['gymAssets', 'trainers']),
    ...mapGetters('calendar', ['assetsById', 'trainersById']),
    courseName () {
      return courseDraftObservable.name
    },
    title () {
      const locationBeingEdited = this.locationBeingEdited
      const weekdays = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ]
      const weekdayLetter = this.selectedDate ? this.$t(`days.${weekdays[this.selectedDate.getDay()]}`)[0] : ''
      const date = this.selectedDate ? this.selectedDate.getDate().toString().padStart(2, '0') : ''

      return `${this.$t('calendar.calendar_manager_modal.calendar_manager')}: ${this.courseName} ${locationBeingEdited && (this.assetsById[locationBeingEdited.roomId]?.name || locationBeingEdited.address.loc)} | ${this.trainerBeingEdited ? `${this.trainersById[this.trainerBeingEdited.trainerId].displayName} |` : ''} ${weekdayLetter}${date}`
    },
    selectedDate: {
      get () {
        if (!this.draft) {
          return null
        }

        const d = new Date(this.draft.datetime.start.getTime())
        d.setHours(0, 0, 0, 0)
        return d
      },
      set (v) {
        const { start, end } = this.draft.datetime

        start.setFullYear(v.getFullYear())
        start.setMonth(v.getMonth())
        start.setDate(v.getDate())

        end.setFullYear(v.getFullYear())
        end.setMonth(v.getMonth())
        end.setDate(v.getDate())

        this.draft.datetime = { start, end } // force view to update
      }
    },
    dates () {
      if (!this.baseDate) { return [] }

      const output = []
      const n = 7
      for (let i = 0; i < 7; i++) {
        const d = new Date(this.baseDate.getTime())
        d.setDate(this.baseDate.getDate() + (this.dateShift * n) + i)
        output.push(d)
      }

      return output
    },
    trainerBeingEdited () {
      return this.draft?.trainers[this.editTrainerIndex]
    },
    locationBeingEdited () {
      return this.draft?.location[this.editLocationIndex]
    },
    month () {
      if (!this.dates.length) {
        return ''
      }

      const lang = this.$route.query.language
      const locale = lang === 'en' || lang === 'it' ? lang : 'en'

      return this.dates[0].toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric'
      })
    },
    showTrainersRow () {
      return !!this.draft?.trainers.length
    }
  },
  beforeDestroy () {
    if (this.timebandInteractable) {
      this.timebandInteractable.unset()
    }
  },
  methods: {
    show (source, saveAction) {
      this.draft = this.$utils.clone(source)
      this.saveAction = saveAction
      this.unwatch = this.$watch('draft', () => {
        this.hasUnsavedChanges = true
      }, { deep: true })
      this.$refs.baseModal.show()
    },
    onShown () {
      const d = new Date(this.draft.datetime.start.getTime())
      d.setHours(0, 0, 0, 0)
      this.baseDate = d
      this.hourHeight = this.$refs.hours.querySelector('.hour').clientHeight
      this.createTimeband()
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
      this.unwatch()
      Object.assign(this.$data, this.$options.data.call(this))
    },
    showAddRoomsPopup () {
      this.$refs.addRoomsPopup.show(
        this.draft.location.filter(({ type }) => type === 'room')
          .map(({ roomId }) => roomId)
      )
    },
    addRooms (roomIds) {
      const maxAge = courseDraftObservable.age.max

      this.draft.location = this.draft.location.concat(
        roomIds.map((roomId) => {
          const { capacity } = this.assetsById[roomId]

          return { type: 'room', roomId, capacity: maxAge > 12 ? capacity.adult : capacity.children }
        })
      )
    },
    selectLocation (roomId) {
      const maxAge = courseDraftObservable.age.max

      const { capacity } = this.assetsById[roomId]

      this.draft.location.splice(this.editLocationIndex, 1, { type: 'room', roomId, capacity: maxAge > 12 ? capacity.adult : capacity.children })
    },
    removeLocation (index) {
      if (this.editLocationIndex === index) {
        this.editLocationIndex = 0
      }

      this.draft.location.splice(index, 1)
    },
    shiftRoomsLeft () {
      this.$refs.rooms.scrollLeft -= 50
    },
    shiftRoomsRight () {
      this.$refs.rooms.scrollLeft += 50
    },
    showAddTrainersPopup () {
      this.$refs.addTrainersPopup.show(this.draft.trainers.map(({ trainerId }) => trainerId))
    },
    addTrainers (trainerIds) {
      this.draft.trainers = this.draft.trainers.concat(
        trainerIds.map(trainerId => ({ trainerId, time: { ...lessonDraftObservable.time } }))
      )
    },
    selectTrainer (trainerId) {
      this.draft.trainers.splice(this.editTrainerIndex, 1, { trainerId, time: { ...lessonDraftObservable.time } })
    },
    removeTrainer (index) {
      if (this.editTrainerIndex === index) {
        this.editTrainerIndex = 0
      }

      this.draft.trainers.splice(index, 1)
    },
    shiftTrainersLeft () {
      this.$refs.trainers.scrollLeft -= 50
    },
    shiftTrainersRight () {
      this.$refs.trainers.scrollLeft += 50
    },
    showLocationCapacityPopup (location) {
      this.$refs.locationCapacityPopup.show(location)
    },
    drawTimeband () {
      let hh, mm
      const el = this.$refs.timeband

      const { start, end } = this.draft.datetime
      hh = start.getHours()
      mm = start.getMinutes()
      const y = (hh + mm / 60) * this.hourHeight
      el.dataset.y = y
      el.style.transform = `translateY(${y}px)`

      hh = end.getHours()
      mm = end.getMinutes()
      el.style.height = `${(hh + mm / 60) * this.hourHeight - y}px`
    },
    createTimeband () {
      this.drawTimeband()

      this.timebandInteractable = interact(this.$refs.timeband)

      // snapping 10 min increments/decrements
      // const gridTarget = interact.snappers.grid({
      //   x: this.hourHeight / 6,
      //   y: this.hourHeight / 6
      // })

      this.timebandInteractable
        .draggable({
          // modifiers: [
          //   interact.modifiers.snap({ targets: [gridTarget] })
          // ],
          // keep the element within the area of it's parent
          restrict: {
            restriction: 'parent',
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
          },
          onmove: this.onDragMove,
          onend: this.onEnd
        })

      this.timebandInteractable
        .resizable({
          edges: {
            top: true,
            bottom: true
          },
          restrict: {
            restriction: 'parent',
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
          },
          onmove: this.onResizeMove,
          onend: this.onEnd
        })
    },
    removeTimeband () {
      this.$refs.timeband.removeAttribute('data-y')
      this.timebandInteractable.unset()
    },
    onDragMove (e) {
      const target = e.target
      const { start } = this.draft.datetime
      const hh = start.getHours()
      const mm = start.getMinutes()
      const initialPosition = (hh + mm / 60) * this.hourHeight

      const y =
          (parseFloat(target.dataset.y) || initialPosition) +
          e.dy

      // translate the element
      target.style.transform = `translateY(${y}px)`

      // update the position attributes
      target.dataset.y = y
    },
    onResizeMove (e) {
      const target = e.target
      let { y } = target.dataset
      const { start } = this.draft.datetime
      const hh = start.getHours()
      const mm = start.getMinutes()
      const initialPosition = (hh + mm / 60) * this.hourHeight

      y = (parseFloat(y) || initialPosition) + e.deltaRect.top

      Object.assign(e.target.style, {
        height: `${e.rect.height}px`,
        transform: `translateY(${y}px)`
      })

      target.dataset.y = y
    },
    onEnd (event) {
      const target = event.target
      const wrapperTop = this.$refs.hours.getBoundingClientRect().top
      const s = (target.getBoundingClientRect().top - wrapperTop) / this.hourHeight
      const e = (target.getBoundingClientRect().bottom - wrapperTop) / this.hourHeight

      const { start, end } = this.draft.datetime
      start.setHours(Math.floor(s))
      start.setMinutes(Math.round((s % 1) * 60))

      end.setHours(Math.floor(e))
      end.setMinutes(Math.round((e % 1) * 60))

      this.draft.datetime = { start, end } // force view to update
    },
    save () {
      this.saveAction(this.draft)
      this.$refs.baseModal.hide()
    }
  }
}
</script>

<style lang="postcss">
.calendar-manager-content-class {
  @apply bg-gray-750 !important;

  & .base-modal__title {
    @apply text-sm;
  }
}

.calendar-manager-body-class {
  @apply pt-0 px-0 !important;
}
</style>

<style lang="postcss" scoped>
::v-deep input[type="radio"] {
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
  @apply absolute w-0 h-0 overflow-hidden;
}

.scrollbar-hidden {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */

  &::-webkit-scrollbar {
    height: 0;
    background: transparent; /* Chrome/Safari/Webkit */
  }
}

.available {
  background-color: #637c41;
}

.hours {
  counter-reset: hour -1;
  @apply relative w-5/6 mt-6 mx-auto;
}

.hour {
  @apply flex items-start h-12 pointer-events-none;

  &::before {
    counter-increment: hour;
    content: counter(hour, decimal-leading-zero) ":00";
    @apply relative block text-xs transform -translate-y-1/2;
  }

  &::after {
    content: '';
    @apply flex-1 block ml-2 border-b;
  }
}
</style>
