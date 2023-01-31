<template>
  <div @focusin="$attrs.listeners.focus">
    <div class="flex justify-between items-center space-x-12">
      <div class="flex items-center">
        <span>
          {{ $t('calendar.lesson_modal.recurrence.label') }}
        </span>
        <base-icon
          v-tippy="{
            content: $attrs.tooltip,
            placement: 'bottom',
          }
          "
          class="ml-2"
          name="question-circle"
          size="20"
        />
      </div>
      <base-select
        :value="recurrence"
        :items="recurrenceOptions"
        input-class="text-center"
        :clearable="false"
        return-object
        @input="onRecurrenceChange"
      />
      <base-select
        :value="period"
        :items="periodOptions"
        :clearable="false"
        @input="onPeriodChange"
      />
    </div>
    <div v-show="period === 'week'" class="mt-4 mb-8">
      <div class="flex justify-between">
        <base-checkbox v-model="dayOfWeek_" :label="weekdayLabels[0]" :value="1" />
        <base-checkbox v-model="dayOfWeek_" :label="weekdayLabels[1]" :value="2" />
        <base-checkbox v-model="dayOfWeek_" :label="weekdayLabels[2]" :value="3" />
        <base-checkbox v-model="dayOfWeek_" :label="weekdayLabels[3]" :value="4" />
      </div>
      <div class="flex justify-around mt-4">
        <base-checkbox v-model="dayOfWeek_" :label="weekdayLabels[4]" :value="5" />
        <base-checkbox v-model="dayOfWeek_" :label="weekdayLabels[5]" :value="6" />
        <base-checkbox v-model="dayOfWeek_" :label="weekdayLabels[6]" :value="0" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    period: { type: String, default: 'week' },
    recurrence: { type: Number, default: 1 },
    dayOfWeek: { type: Array, default: () => [] }
  },
  data () {
    return {
      periodOptions: [
        { text: this.$t('calendar.lesson_modal.recurrence.weeks'), value: 'week' },
        { text: this.$t('calendar.lesson_modal.recurrence.days'), value: 'day' }
      ],
      recurrenceOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      weekdayLabels: [
        this.$t('days.monday'),
        this.$t('days.tuesday'),
        this.$t('days.wednesday'),
        this.$t('days.thursday'),
        this.$t('days.friday'),
        this.$t('days.saturday'),
        this.$t('days.sunday')
      ].map(d => this.$utils.upperFirst(d.slice(0, 3)))
    }
  },
  computed: {
    dayOfWeek_: {
      get () {
        return this.dayOfWeek
      },
      set (v) {
        this.$emit('update:dayOfWeek', v)
        this.$emit('change')
      }
    }
  },
  methods: {
    onRecurrenceChange (e) {
      this.$emit('update:recurrence', e)
      this.$emit('change')
    },
    onPeriodChange (e) {
      this.$emit('update:period', e)
      this.$emit('change')
    }
  }
}
</script>
