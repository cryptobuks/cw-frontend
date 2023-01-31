<template>
  <div class="flex flex-col">
    <div
      v-for="(day, gymWeekDayIndex) in weekdays"
      :key="`gym-week-day-${gymWeekDayIndex}`"
      class="shadow-cw-card w-full flex justify-between items-center rounded-lg my-2 p-0 cursor-default"
    >
      <base-swipe-card
        bg-color="#fff"
        toggler-color="black"
        toggler-class="text-black"
        auto-height
        class="w-full text-red"
        :actions="swipeActions(day)"
      >
        <div class="flex justify-between items-center p-0 mr-5 text-black">
          <div class="flex flex-col">
            <h5 class="font-bold">
              {{ day.longDay }}
            </h5>
            <span
              class="text-sm"
              :class="!day.closed ? 'text-green' : 'text-red'"
            >{{ !day.closed ? "OPEN" : "CLOSED" }}</span>
          </div>

          <div class="flex flex-col min-w-15">
            <div
              v-for="(time, index) in day.time"
              :key="`${day.day}-time-${index}`"
              class="flex justify-between my-1"
            >
              <div class="flex justify-start" style="width : 45px">
                {{ time.from }}
              </div>
              <span>-</span>
              <div class="flex justify-end" style="width : 45px">
                {{ time.to }}
              </div>
            </div>
          </div>
        </div>
      </base-swipe-card>
    </div>
  </div>
</template>

<script>
export default {
  props: { weekdays: { type: Array, required: true } },
  methods: {
    swipeActions (day) {
      const actions = []
      if (this.$listeners?.edit) {
        actions.push({
          icon: 'pen',
          handler: () => this.$emit('edit', day)
        })
      }
      if (this.$listeners?.delete) {
        actions.push({
          icon: 'bin',
          danger: true,
          color: 'white',
          handler: () => this.$emit('delete', day)
        })
      }
      return actions
    }
  }
}
</script>
