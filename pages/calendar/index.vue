<template>
  <cw-calendar-main>
    <template #switcher>
      <nuxt-link to="/calendar/planning">
        <base-icon name="calendar-switch" :size="30" />
      </nuxt-link>
    </template>

    <template v-slot="{ dates }">
      <div class="grid grid-cols-1 xl:grid-cols-5 gap-2 p-4">
        <base-masonry-list
          ref="masonry"
          v-slot="{ item: lesson }"
          class="max-w-full flex xl:hidden"
          v-bind="{
            itemClass: 'mb-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 px-1',
            items: lessons,
          }"
        >
          <cw-calendar-course-card :lesson="lesson" class="mb-4" />
          <cw-appointment-card class="mb-4" />
          <cw-calendar-rentable-card :lesson="lesson" />
        </base-masonry-list>
        <div
          v-for="(date, dateIndex) in dates"
          :key="`date-index-${dateIndex}`"
          class="hidden xl:flex flex-col space-y-2"
        >
          <cw-calendar-course-card
            v-for="(lesson, i) in lessonsByDate[date.value.toISOString()]"
            :key="i"
            :lesson="lesson"
          />
          <cw-appointment-card class="mb-4" />
          <cw-calendar-rentable-card />
        </div>
      </div>
    </template>
  </cw-calendar-main>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState('calendar', ['selectedDate']),
    ...mapGetters('calendar', ['lessonsByDate']),
    lessons () {
      const output = this.selectedDate
        ? this.lessonsByDate[this.selectedDate.toISOString()] ?? []
        : []
      return output
    }
  },
  created () {
    this.getRentables()
  },
  methods: mapActions('calendar', ['getRentables']),
  head () {
    return {
      title: this.$t('nav.calendar')
    }
  }
}
</script>
