<template>
  <base-modal
    v-bind="{ ...$attrs, ref: 'modal', title }"
    v-on="$listeners"
    @dismiss="hide"
  >
    <base-form
      v-slot="{ rules }"
      class="flex flex-col justify-between w-full h-full"
      @submit="submit"
    >
      <div class="flex flex-col">
        <base-flatpickr
          v-model="range"
          v-bind="{ closeddays: closedDays(), flatpickrConfig, theme: 'light' }"
        />
        <base-switcher
          v-model="exception.isClosed"
          :false-text="$t('gym.open_hours.open')"
          :true-text="$t('gym.open_hours.closed')"
          false-color="green"
          true-color="red"
          class="rounded-full my-4 w-20"
        />
        <cw-time-range-input
          v-if="!exception.isClosed"
          v-model="exception.time"
          v-bind="{ rules }"
        />
      </div>

      <base-button
        type="submit"
        :disabled="(exception.time.length < 1 && !exception.isClosed) || !range"
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
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: { type: null, required: true },
    exceptions: { type: Array, default: () => null }
  },
  data: () => ({
    exception: { isClosed: true, range: null, from: null, to: null, time: [] },
    submitting: false
  }),
  computed: {
    ...mapGetters('gym-hours', ['closedDays']),
    ...mapState('gym-hours', ['gymHours']),
    flatpickrConfig () {
      return {
        mode: 'range',
        dateFormat: 'Ymd',
        inline: true,
        defaultDate: this.range,
        minDate: new Date(),
        disable: this.gymHours.exceptions.map(exception => ({
          ...exception.dates
        }))
      }
    },
    range: {
      get () {
        const { from, to } = this.exception
        return from && to ? `${from} to ${to}` : null
      },
      set (range) {
        const [from, tempTo] = range.split(' to ')
        const to = tempTo || from
        this.exception = {
          ...this.exception,
          from: Number(from),
          to: Number(to)
        }
      }
    },
    title () {
      if (this.exception.from == null) {
        return 'Select A Date'
      }
      let { from, to } = this.exception
      from = this.$dayjs(this.$utils.digitToDate(from)).format('DD.MM.YYYY')
      to = !to
        ? from
        : this.$dayjs(this.$utils.digitToDate(to)).format('DD.MM.YYYY')
      return from === to ? from : `${from} to ${to}`
    }
  },
  methods: {
    ...mapActions('gym-hours', ['setGymHours']),
    show (exception) {
      if (exception) {
        this.exception = exception
      }
      this.$refs.modal.show()
    },
    hide () {
      Object.assign(this.$data, this.$options.data.call(this))
      this.$refs.modal.hide()
    },
    submit () {
      const exceptions = [
        ...(this.exceptions || this.value).filter(
          // remove current exception
          e => e.from !== this.exception.from || e.to !== this.exception.to
        ),
        this.exception
      ].map(exception => ({
        ...exception,
        from: Number(exception.from),
        to: Number(exception.to),
        dates: {
          from: this.$utils.digitToDate(exception.from),
          to: this.$utils.digitToDate(exception.to)
        }
      }))
      this.exceptionsSort(exceptions)
      this.$emit('change', exceptions)
      this.hide()
    },
    exceptionsSort (exceptions) {
      function compare (a, b) {
        const fromA = a.from
        const fromB = b.from
        let comparison = 0
        if (fromA < fromB) {
          comparison = 1
        } else if (fromA > fromB) {
          comparison = -1
        }
        return comparison
      }
      exceptions.sort(compare)
    }
  }
}
</script>
