<template>
  <div v-if="exceptions.length > 0">
    <div
      v-for="(exception, exceptionIndex) in exceptions"
      :key="`gym-hours-exceptions-${exceptionIndex}`"
      class="shadow-cw-card w-full flex justify-between items-center rounded-lg my-2 p-0 cursor-default"
    >
      <base-swipe-card
        bg-color="#fff"
        toggler-class="text-black"
        toggler-color="black"
        auto-height
        class="w-full text-red"
        :actions="actions(exception)"
      >
        <div
          class="swipeCardText flex justify-between items-center p-0 mr-5 text-black"
        >
          <div class="flex flex-col">
            <span
              v-if="
                $utils.formatDate(exception.dates.from) !==
                  $utils.formatDate(exception.dates.to)
              "
              class="font-black"
            >
              {{ $utils.formatDate(exception.dates.from) }} -
              {{ $utils.formatDate(exception.dates.to) }}</span>
            <span v-else class="font-black">
              {{ exception.dates.from.toString().substring(0, 3) }}
              {{ $utils.formatDate(exception.dates.from) }}</span>
            <span :class="[!exception.isClosed ? 'text-green' : 'text-red']">{{
              !exception.isClosed ? "OPEN" : "CLOSED"
            }}</span>
          </div>

          <div
            v-if="!exception.isClosed"
            class="flex flex-col min-w-15"
          >
            <div
              v-for="(time, timeIndex) in exception.time"
              :key="`exception-time-${timeIndex}`"
              class="flex justify-between items-center my-1"
            >
              <span>{{ time.from }}</span>
              <span>-</span>
              <span>{{ time.to }}</span>
            </div>
          </div>
        </div>
      </base-swipe-card>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    exceptions: { type: Array, required: true }
  },
  methods: {
    actions (exception) {
      const actions = [
        {
          icon: 'pen',
          handler: () => this.$emit('edit', exception)
        },
        {
          icon: 'bin',
          danger: true,
          color: 'white',
          handler: () => this.$emit('delete', exception)
        }
      ]
      return actions
    }
  }
}
</script>

<style>
.swipe-card__actions__item {
  min-height: 0 !important;
}

.swipeCardText {
  max-height: 45px;
}
</style>
