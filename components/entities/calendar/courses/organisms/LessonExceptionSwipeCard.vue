<template>
  <base-swipe-card
    v-if="hasExceptions"
    :actions="actions"
    bg-color="gray"
    horizontal-actions
    auto-height
  >
    <div class="flex space-x-3 text-xs">
      <span class="column">{{ date }}</span>
      <span v-if="timebandException" class="column">
        {{ timebandException }}
      </span>
      <span v-if="roomExceptions.length" class="column flex items-center space-x-1">
        <span v-for="({ _id, name }) in roomExceptions" :key="_id">{{ name }}</span>
      </span>
      <span v-if="trainerExceptions.length" class="column flex items-center space-x-1">
        <span v-for="({ _id, displayName }) in trainerExceptions" :key="_id">{{ displayName }}</span>
      </span>
    </div>
  </base-swipe-card>
</template>

<script>
import { mapState } from 'vuex'
import { courseDraftObservable } from '../shared'

export default {
  props: {
    lesson: { type: Object, required: true },
    entry: { type: Object, required: true }
  },
  data () {
    return {
      actions: [
        { icon: 'pen', handler: () => { this.$emit('edit') } },
        { icon: 'bin', danger: true, handler: () => this.$emit('remove') }
      ],
      maxAge: courseDraftObservable.age.max
    }
  },
  computed: {
    ...mapState('calendar', ['gymAssets', 'trainers']),
    date () {
      const lang = this.$route.query.language
      const locale = lang === 'en' || lang === 'it' ? lang : 'en'

      return this.entry.datetime.start.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    timebandException () {
      let { start, end } = this.entry.datetime

      const entryTimeband = `${this.$utils.formatTime(start)} - ${this.$utils.formatTime(end)}`

      ;({ start, end } = this.lesson.time)
      const lessonTimeband = `${start} - ${end}`

      return (entryTimeband !== lessonTimeband) && entryTimeband
    },
    roomExceptions () {
      const lessonRoomsIds = {}

      this.lesson.location.forEach(({ type, roomId }) => {
        if (type === 'room') {
          lessonRoomsIds[roomId] = true
        }
      })

      const roomExceptionIds = {}

      this.entry.location.forEach(({ roomId }) => {
        if (roomId && !lessonRoomsIds[roomId]) {
          roomExceptionIds[roomId] = true
        }
      })

      return this.gymAssets.filter(({ _id }) => !!roomExceptionIds[_id])
    },
    // TODO: We need a way of tracking/handling exceptions in general and trainer exceptions in particular.
    trainerExceptions () {
      // const lessonTrainerIds = {}

      // this.lesson.trainerIds.forEach((id) => {
      //   lessonTrainerIds[id] = true
      // })

      // const trainerExceptionIds = {}

      // this.entry.trainerIds.forEach((id) => {
      //   if (!lessonTrainerIds[id]) {
      //     trainerExceptionIds[id] = true
      //   }
      // })

      // return this.trainers.filter(({ _id }) => !!trainerExceptionIds[_id])
      return []
    },
    hasExceptions () {
      return !!this.timebandException || this.roomExceptions.length || this.trainerExceptions.length
    }
  }
}
</script>

<style lang="postcss" scoped>
.swipe-card {
  @apply text-black opacity-100;
}

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
