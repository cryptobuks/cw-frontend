<template>
  <base-modal v-bind="{ ref: 'modal', title: $t('gym.open_hours.open_times') }">
    <div v-if="editedGymWeekDays" class="flex flex-col">
      <div
        v-for="(day, weekDayIndex) in editedGymWeekDays"
        :key="`gym-week-day-${weekDayIndex}`"
        class="bg-white text-gray-700 w-full rounded-lg flex justify-between items-center px-3 my-2"
      >
        <div class="h-20 flex items-center">
          <base-switcher
            v-model="day.closed"
            :false-text="day.longDay"
            :true-text="day.longDay"
            true-color="red"
            false-color="#6caa46"
            class="border rounded-full"
          />
        </div>
        <div
          v-if="!day.closed"
          class="flex items-center justify-right cursor-pointer"
          @click="editWeekday(day)"
        >
          <div class="flex flex-col min-w-15">
            <div
              v-for="(time, timeIndex) in day.time"
              :key="`${weekDayIndex}-time-${timeIndex}`"
              class="flex justify-between items-center my-1"
            >
              <span class="underline">{{ time.from }}</span>
              <span>-</span>
              <span class="underline">{{ time.to }}</span>
            </div>
          </div>
          <base-icon class="ml-4" name="chevron-right" />
        </div>
      </div>
    </div>

    <cw-weekday-modal ref="weekDayModal" v-model="editedGymWeekDays" />
  </base-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  data: () => ({
    editedGymWeekDays: null
  }),
  computed: {
    ...mapGetters('gym-hours', ['gymStatus', 'gymWeekDays'])
  },
  watch: {
    editedGymWeekDays: {
      immediate: true,
      deep: true,
      handler (weekdays) {
        if (weekdays === null) {
          return (this.editedGymWeekDays = this.gymWeekDays().map(d => ({
            ...d,
            time: d.time ? d.time : [{ from: '07:00', to: '22:00' }]
          })))
        }
        weekdays = weekdays
          .filter(day => !day.closed)
        this.setGymHours({ weekdays })
      }
    }
  },
  methods: {
    ...mapActions('gym-hours', ['setGymHours']),
    editWeekday (day) {
      this.$refs.weekDayModal.show(day)
    },
    show () {
      this.$refs.modal.show()
    }
  }
}
</script>
