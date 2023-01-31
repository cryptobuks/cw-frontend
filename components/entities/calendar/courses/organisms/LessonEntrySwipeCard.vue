<template>
  <base-swipe-card
    :actions="actions"
    bg-color="#404040"
    horizontal-actions
    auto-height
  >
    <template #title>
      <div class="flex text-sm">
        <span class="flex-1 truncate">{{ date }}</span>
        <span>{{ timeband }}</span>
      </div>
    </template>

    <div class="flex space-x-3 text-xs">
      <div v-for="({id, name, type, capacity}) in selectedRooms" :key="id" class="column flex items-center">
        <span>{{ name }}</span>
        <base-icon v-if="type === 'virtual'" name="wifi" size="14" class="ml-1" />
        <base-icon name="person" size="12" class="ml-1" />
        <span class="ml-1">{{ capacity }}</span>
      </div>
    </div>

    <div class="flex space-x-3 text-xs">
      <div v-for="({_id, displayName}) in selectedTrainers" :key="_id" class="column flex items-center">
        {{ displayName }}
      </div>
    </div>
  </base-swipe-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { courseDraftObservable } from '../shared'

export default {
  props: {
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
    ...mapGetters('calendar', ['assetsById']),
    date () {
      const lang = this.$route.query.language
      const locale = lang === 'en' || lang === 'it' ? lang : 'en'

      return this.entry.datetime.start.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    timeband () {
      const { start, end } = this.entry.datetime

      return `${this.$utils.formatTime(start)} - ${this.$utils.formatTime(end)}`
    },
    selectedRooms () {
      return this.entry.location.filter(({ type }) => type === 'room')
        .map(({ roomId, capacity }) => ({
          id: roomId,
          name: this.assetsById[roomId].name,
          type: this.assetsById[roomId].type,
          capacity
        }))
    },
    selectedTrainers () {
      const trainerIds = {}

      this.entry.trainers.forEach(({ trainerId }) => {
        trainerIds[trainerId] = true
      })

      return this.trainers.filter(({ _id }) => trainerIds[_id])
    }
  }
}
</script>

<style lang="postcss" scoped>
.swipe-card {
  @apply opacity-100;
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
