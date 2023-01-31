<template>
  <base-modal ref="baseModal" title="Add Lesson">
    <base-form @submit.prevent>
      <base-progressive-fields-container :fields="fields" show-all-fields>
        <template #recurrence="{ inputAttrs }">
          <div class="flex justify-between items-center w-full mb-8">
            <div class="flex items-center">
              <span>
                Recurrence
              </span>
              <base-icon
                v-tippy="{
                  content: '',
                  placement: 'bottom',
                }
                "
                name="question-circle"
                size="20"
                style="margin-left: 16px"
              />
            </div>
            <base-select v-model="recurrence.number" :items="inputAttrs.number" :clearable="false" style="width: 20%" return-object />
            <base-select
              v-model="recurrence.period"
              :items="inputAttrs.period"
              :disabled="recurrence.number === 'none'"
              :clearable="false"
              style="width: 20%"
              return-object
            />
          </div>
        </template>

        <template #venue="{ inputAttrs }">
          <cw-input-venue :period="period" v-bind="inputAttrs" />
        </template>

        <template #trainer="{ inputAttrs }">
          <cw-input-trainer :items="[1, 2, 3]" v-bind="inputAttrs" />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <template #actions>
      <base-button
        class="action-btn"
        @click="save"
      >
        Save
      </base-button>

      <base-button
        class="action-btn ml-5"
        @click="save"
      >
        Save & Duplicate
      </base-button>
    </template>
  </base-modal>
</template>

<script>
export default {
  props: {
    lessons: { type: Array, required: true },
    period: { type: Object, required: true }
  },
  data: () => ({
    fields: [
      {
        name: 'recurrence',
        number: ['none', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        period: ['weeks', 'days']
      },
      {
        name: 'venue',
        label: 'ROOM | WEEKDAY | TIME',
        placeholder: 'Main room - weekday - time band',
        tooltip: 'Choose the main room / day / time band where the lesson will be done. You can add more rooms after the main one'
      },
      {
        name: 'trainer',
        label: 'Add Trainer',
        tooltip: 'Add one or more trainers to all the lessons'
      }
    ],
    recurrence: {
      number: 1,
      period: 'weeks'
    }
  }),
  methods: {
    show () {
      this.$refs.baseModal.show()
    },
    save () {
      const repeat = []
      const { start: courseStart, end: courseEnd } = this.period

      let start = new Date(courseStart.getTime())
      let end = new Date(start.getTime())
      end.setHours(end.getHours() + 1)
      repeat.push({ start, end })

      if (this.recurrence.number !== 'none') {
        const increment = this.recurrence.period === 'days' ? this.recurrence.number : this.recurrence.number * 7

        while (start.getTime() <= courseEnd.getTime()) {
          start = new Date(start.getTime())
          start.setDate(start.getDate() + increment)
          if (start.getTime() <= courseEnd.getTime()) {
            end = new Date(start.getTime())
            end.setHours(end.getHours() + 1)
            repeat.push({ start, end })
          }
        }
      }

      this.lessons.push({ repeat, _recurrence: this.recurrence })
      this.$refs.baseModal.hide()
    }
  }
}
</script>

<style lang="postcss" scoped>
.action-btn {
  @apply uppercase;

  &.base-button {
    @apply rounded-lg h-12 !important;
  }
}
</style>
