<template>
  <base-modal
    ref="baseModal"
    content-class="add-venue-content-class"
    body-class="add-venue-body-class"
    :perfect-scrollbar-options="{ suppressScrollY: true }"
    title="Room - Day - Time band"
    :disabled="!selectedRoom || !timebandExists"
    @shown="onShown"
    @done="save"
  >
    <div class="bg-gray-150 text-black p-3">
      <div class="flex justify-between mx-3">
        <label
          v-for="({ text, value }, i) in weekdays"
          :key="i"
          class="flex justify-center items-center text-lg font-semibold w-10 h-10 rounded-md cursor-pointer"
          :class="{ selected: value === selectedDay }"
        >
          <input v-model="selectedDay" type="radio" :value="value">
          <span>{{ text }}</span>
        </label>
      </div>

      <div class="text-center mt-3">
        <cw-period-date-picker v-model="coursePeriod" class="date-picker" data-label="Period" light naked />
      </div>

      <!-- TODO: Make this dynamic -->
      <div class="flex items-center mt-2">
        <button class="focus:outline-none">
          <base-icon name="chevron-left" />
        </button>
        <div class="w-full grid grid-cols-5 gap-x-1">
          <label
            v-for="(room, i) in rooms"
            :key="i"
            class="bg-gray-500 text-xs text-white py-1 rounded-md cursor-pointer transition-colors duration-100"
            :class="{ selected: selectedRoom === room }"
          >
            <input v-model="selectedRoom" type="radio" :value="room">
            <span class="flex justify-center items-center">
              <span class="truncate">{{ room.name }}</span>
              <base-icon class="mx-1" name="person" />
              <span>{{ room.capacity }}</span>
            </span>
          </label>
        </div>
        <button class="focus:outline-none">
          <base-icon name="chevron-right" />
        </button>
      </div>
    </div>

    <base-scroll style="height: calc(100% - 160px)">
      <div ref="hours" class="hours" :class="{ 'cursor-pointer': !timebandExists }" @click.self="createTimeband">
        <div class="absolute inset-0 pointer-events-none" style="margin-left: 38px; bottom: 48px">
          <div
            v-show="timebandExists"
            ref="timeband"
            class="flex items-center w-full text-black px-3 rounded-lg pointer-events-auto"
            style="background: #8fa8d1; touch-action: none"
            @dblclick="showEditTimebandPopup(startTime, endTime)"
          >
            <!-- TODO: make this dynamic -->
            <span class="flex-1 text-xs">{{ timebandText }}</span>
            <button @click="removeTimeband">
              <base-icon name="bin" />
            </button>
          </div>
        </div>
        <div v-for="n in 25" :key="n" class="hour" />
      </div>
    </base-scroll>

    <cw-edit-timeband-popup ref="editTimebandPopup" :selected-day="selectedDay" @update="updateTimeband" />
  </base-modal>
</template>

<script>
import interact from 'interactjs'

export default {
  props: {
    period: { type: Object, required: true }
  },
  data: () => ({
    weekdayValues: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ],
    selectedDay: 'monday',
    rooms: [
      { name: 'Room Paris', capacity: 15 },
      { name: 'Room Red', capacity: 12 },
      { name: 'Room Red', capacity: 11 },
      { name: 'Room Black', capacity: 9 },
      { name: 'Room Small', capacity: 5 }
    ],
    selectedRoom: null,
    startTime: null,
    endTime: null,
    hourHeight: null,
    timebandInteractable: null
  }),
  computed: {
    weekdays () {
      return this.weekdayValues.map(v => ({
        text: this.$t(`days.${v}`)[0],
        value: v
      }))
    },
    coursePeriod: {
      get () {
        const { start, end } = this.period
        return [new Date(start).toISOString(), new Date(end).toISOString()]
      },
      set (v) {
        const [start, end] = v.split(' - ')
        this.period.start = start ? new Date(start) : null
        this.period.end = end ? new Date(end) : null
      }
    },
    timebandExists () {
      return !!(this.startTime && this.endTime)
    },
    timebandText () {
      const start = this.startTime
      const end = this.endTime
      return this.timebandExists
        ? `Spinning | ${start.hh.toString().padStart(2, '0')}:${start.mm.toString().padStart(2, '0')} - ${end.hh.toString().padStart(2, '0')}:${end.mm.toString().padStart(2, '0')} | 30 ${this.$utils.upperFirst(this.selectedDay)}s out of 30 | 100%`
        : ''
    }
  },
  beforeDestroy () {
    if (this.timebandInteractable) {
      this.timebandInteractable.unset()
    }
  },
  methods: {
    show () {
      this.$refs.baseModal.show()
    },
    onShown () {
      // reset state
      Object.assign(this.$data, this.$options.data.call(this))
    },
    showEditTimebandPopup (from, to) {
      this.$refs.editTimebandPopup.show(from, to)
    },
    drawTimeband () {
      let hh, mm
      const el = this.$refs.timeband

      if (this.timebandExists && this.hourHeight) {
        ({ hh, mm } = this.startTime)
        const y = (hh + mm / 60) * this.hourHeight
        el.dataset.y = y
        el.style.transform = `translateY(${y}px)`

        ;({ hh, mm } = this.endTime)
        el.style.height = `${(hh + mm / 60) * this.hourHeight - y}px`
      }
    },
    createTimeband (e) {
      if (!this.timebandExists) {
        const timetable = e.target
        this.hourHeight = timetable.querySelector('.hour').clientHeight
        const startTime = e.offsetY / this.hourHeight
        const hh = Math.floor(startTime)
        const mm = Math.round((startTime % 1) * 4) * 15 // closest 15 min increments
        this.startTime = {
          hh: mm !== 60 ? hh : hh + 1,
          mm: mm !== 60 ? mm : 0
        }
        this.endTime = { hh: this.startTime.hh + 1, mm: this.startTime.mm }
        this.drawTimeband()
        this.showEditTimebandPopup(this.startTime, this.endTime)

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
      }
    },
    updateTimeband (from, to) {
      this.startTime = from
      this.endTime = to
      this.drawTimeband()
    },
    removeTimeband () {
      this.startTime = this.endTime = null
      this.$refs.timeband.removeAttribute('data-y')
      this.timebandInteractable.unset()
    },
    onDragMove (e) {
      const target = e.target
      const { hh, mm } = this.startTime
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
      const { hh, mm } = this.startTime
      const initialPosition = (hh + mm / 60) * this.hourHeight

      y = (parseFloat(y) || initialPosition) + e.deltaRect.top

      Object.assign(e.target.style, {
        height: `${e.rect.height}px`,
        transform: `translateY(${y}px)`
      })

      target.dataset.y = y
    },
    onEnd (e) {
      let hh, mm
      const target = e.target
      const wrapperTop = this.$refs.hours.getBoundingClientRect().top
      const startTime = (target.getBoundingClientRect().top - wrapperTop) / this.hourHeight
      const endTime = (target.getBoundingClientRect().bottom - wrapperTop) / this.hourHeight

      hh = Math.floor(startTime)
      mm = Math.round((startTime % 1) * 60)

      this.startTime = {
        hh: mm !== 60 ? hh : hh + 1,
        mm: mm !== 60 ? mm : 0
      }

      hh = Math.floor(endTime)
      mm = Math.round((endTime % 1) * 60)

      this.endTime = {
        hh: mm !== 60 ? hh : hh + 1,
        mm: mm !== 60 ? mm : 0
      }
    },
    save () {
      this.$emit('add', {
        day: this.selectedDay,
        room: this.selectedRoom,
        startTime: this.startTime,
        endTime: this.endTime
      })
      this.$refs.baseModal.hide()
    }
  }
}
</script>

<style lang="postcss">
.add-venue-content-class {
  @apply bg-gray-750 !important;
}

.add-venue-body-class {
  @apply pt-0 px-0 !important;
}
</style>

<style lang="postcss" scoped>
input[type="radio"] {
  clip: rect(0 0 0 0);
  clip-path: inset(100%);
  @apply absolute w-0 h-0 overflow-hidden;
}

.date-picker {
  width: max-content;
  @apply flex items-center mx-auto;

  & ::v-deep input {
    @apply text-sm font-semibold;
  }

  &::before {
    content: attr(data-label);
    width: max-content;
    padding: 6px 0;
    @apply flex items-center top-0 left-0 h-full text-sm font-semibold;
  }
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

.selected  {
  @apply bg-cw-red text-white;
}
</style>
