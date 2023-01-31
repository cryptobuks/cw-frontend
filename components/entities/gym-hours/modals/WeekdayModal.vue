<template>
  <base-modal
    ref="modal"
    v-bind="$attrs"
    :title="weekday && weekday.longDay"
    v-on="$listeners"
  >
    <base-form
      v-slot="{ rules }"
      class="flex flex-col justify-between h-full"
      @submit="submit()"
    >
      <div class="flex flex-col">
        <base-switcher
          v-if="!hideToggler"
          v-model="weekday.closed"
          :false-text="$t('gym.open_hours.open')"
          :true-text="$t('gym.open_hours.closed')"
          true-color="red"
          false-color="green"
          class="rounded-full my-4 w-20"
        />
        <cw-time-range-input
          v-if="!weekday.closed"
          v-model="weekday.time"
          v-bind="{ rules }"
        />
      </div>
      <base-button
        type="submit"
        :disabled="weekday.time && weekday.time.lenght < 1"
        :loading="submitting"
        xl
        class="mb-10"
      >
        <base-icon name="save" />
      </base-button>
    </base-form>
  </base-modal>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: { type: null, required: true },
    weekdays: { type: Array, default: () => null },
    hideToggler: Boolean
  },
  data: () => ({ weekday: null, submitting: false }),
  methods: {
    show (weekday) {
      this.weekday = this.$utils.clone(weekday)
      this.$refs.modal.show()
    },
    submit (weekday = null) {
      weekday = weekday == null ? this.weekday : weekday
      const weekdays = (this.weekdays || this.value).map(day => ({
        ...day,
        closed: day.day === weekday.day ? weekday.closed : day.closed,
        time: day.day === weekday.day ? weekday.time : day.time
      }))

      this.$emit('change', weekdays)
      this.$refs.modal.hide()
    }
  }
}
</script>
