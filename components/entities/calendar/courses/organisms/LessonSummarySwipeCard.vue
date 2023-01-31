<template>
  <base-swipe-card
    :actions="actions"
    bg-color="#404040"
    horizontal-actions
    auto-height
  >
    <div class="text-sm">
      <div>{{ timing }}</div>
      <div v-if="lesson.period === 'week'">
        {{ daysOfWeek }}
      </div>
      <div>every {{ lesson.recurrence }} {{ lesson.period }}(s)</div>
      <div>{{ periodRange }}</div>
      <div class="flex space-x-3 ">
        <div v-for="({_id, name, type, capacity}) in rooms" :key="_id" class="column flex items-center">
          <base-icon v-if="type === 'virtual'" name="wifi" size="14" />
          <span v-else>{{ name }}</span>
          <base-icon name="person" size="12" class="ml-1" />
          <span class="ml-1">{{ maxAge > 12 ? capacity.adult : capacity.children }}</span>
        </div>
      </div>
      <div v-for="({_id, displayName}) in trainers" :key="_id">
        {{ displayName }} | {{ lesson.time.start }} - {{ lesson.time.end }}
      </div>

      <div class="space-y-2 mt-4">
        <cw-lesson-exception-swipe-card
          v-for="(entry, i) in lesson.entries"
          :key="i"
          :lesson="lesson"
          :entry="entry"
          @edit="$emit('edit-entry', i)"
          @remove="$emit('remove-entry', i)"
        />
      </div>
    </div>
  </base-swipe-card>
</template>

<script>
import { mapState } from 'vuex'
import { parseTimeString } from '@/components/entities/calendar/utils'
import { courseDraftObservable } from '../shared'

export default {
  props: {
    lesson: { type: Object, required: true }
  },
  data () {
    return {
      actions: [
        { icon: 'pen', handler: () => this.$emit('edit') },
        { icon: 'bin', danger: true, handler: () => this.$emit('remove') }
      ],
      maxAge: courseDraftObservable.age.max
    }
  },
  computed: {
    ...mapState('calendar', {
      gymAssets: 'gymAssets',
      allTrainers: 'trainers'
    }),
    timing () {
      const { start, end } = this.lesson.time
      const diff = (parseTimeString(end) - parseTimeString(start)) * 60

      return `${start} - ${end} (${diff}min)`
    },
    daysOfWeek () {
      if (this.lesson.period === 'day') {
        return []
      }

      const vals = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ]

      return this.lesson.dayOfWeek
        .slice()
        .sort((a, b) => a - b)
        .map(d => this.$utils.upperFirst(this.$t(`days.${vals[d]}`)).slice(0, 3)).join(' | ')
    },
    periodRange () {
      const { start, end, endAfter } = this.lesson.datetime
      return `${this.$utils.formatDate(start)} - ${this.$utils.formatDate(end)} | ${endAfter} lessons`
    },
    rooms () {
      const rooms = this.lesson.location.filter(({ type }) => type === 'room')

      const roomIds = {}

      rooms.forEach(({ roomId }) => {
        roomIds[roomId] = true
      })

      return this.gymAssets.filter(asset => roomIds[asset._id])
    },
    trainers () {
      return this.allTrainers.filter(trainer => this.lesson.trainerIds.includes(trainer._id))
    }
  }
}
</script>

<style lang="postcss" scoped>
::v-deep .swipe-card__actions__item:nth-of-type(2) {
  @apply border-l border-black border-opacity-25;
}

.column {
  @apply relative;

  &:not(:last-child)::after {
    content: '|';
    right: -8px;
    @apply absolute;
  }
}
</style>
