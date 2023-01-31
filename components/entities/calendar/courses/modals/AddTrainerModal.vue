<template>
  <base-modal
    ref="baseModal"
    :title="$t('calendar.trainer_modal.title')"
    :disabled="!isFormValid"
    @shown="onShown"
    @dismiss="onDismiss"
    @hidden="onHidden"
    @done="save"
  >
    <base-form @submit.prevent>
      <base-progressive-fields-container :fields="fields" :data="draft || {}">
        <template #trainerIds="{ inputAttrs}">
          <base-select
            v-model="draft.trainerIds"
            :items="trainers"
            item-text="displayName"
            item-value="_id"
            hide-selected
            v-bind="inputAttrs"
          />
        </template>

        <template #time="{ inputAttrs }">
          <cw-input-lesson-timing
            :start.sync="draft.time.start"
            :end.sync="draft.time.end"
            :hide-sanification="true"
            v-bind="inputAttrs"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <div v-if="isFormValid" class="space-y-4 mt-8">
      <cw-lesson-entry-swipe-card v-for="(entry, i) in entries" :key="i" :entry="entry" @edit="showCalendarManagerModal(entry)" @remove="removeEntry(i)" />
    </div>

    <cw-calendar-manager-modal ref="calendarManagerModal" />
  </base-modal>
</template>

<script>
import { mapState } from 'vuex'
import { parseTimeString } from '@/components/entities/calendar/utils'
import { lessonDraftObservable } from '../shared'

export default {
  data () {
    return {
      fields: [
        {
          name: 'trainerIds',
          label: this.$t('calendar.trainer_modal.name.label'),
          placeholder: this.$t('calendar.trainer_modal.name.placeholder'),
          tooltip: this.$t('calendar.trainer_modal.name.tooltip'),
          required: true
        },
        {
          name: 'time',
          startLabel: this.$t('global.start'),
          startPlaceholder: this.$t('calendar.lesson_modal.time.start.placeholder'),
          endLabel: this.$t('global.end'),
          endPlaceholder: this.$t('calendar.lesson_modal.time.end.placeholder'),
          durationLabel: this.$t('global.duration'),
          durationPlaceholder: this.$t('calendar.lesson_modal.time.duration.placeholder'),
          timingTooltip: this.$t('calendar.lesson_modal.time.tooltip'),
          isEmpty: v => !!(!v || !v.start || !v.end)
        }
      ],
      draft: {
        trainerIds: [],
        time: {
          start: null,
          end: null
        }
      },
      currentLessonEntries: null,
      hasUnsavedChanges: false
    }
  },
  computed: {
    ...mapState('calendar', ['trainers']),
    isFormValid () {
      const isTrainerSelected = !!this.draft.trainerIds.length

      if (!isTrainerSelected) {
        return false
      }

      const { start, end } = this.draft.time
      const { start: lessonStart, end: lessonEnd } = lessonDraftObservable.time

      const isTimebandValid = !!(
        start && end &&
        (parseTimeString(start) < parseTimeString(end)) &&
        (parseTimeString(start) >= parseTimeString(lessonStart)) &&
        ((parseTimeString(end) <= parseTimeString(lessonEnd)))
      )

      if (!isTimebandValid) {
        return false
      }

      return true
    },
    entries () {
      if (!this.isFormValid) {
        return []
      }

      return this.currentLessonEntries.map(({ trainers, ...rest }) => ({
        ...rest,
        trainers: (trainers ?? []).concat(this.draft.trainerIds.map(id => ({
          trainerId: id,
          time: { ...this.draft.time }
        })))
      }))
    }
  },
  methods: {
    show () {
      this.$refs.baseModal.show()
    },
    onShown () {
      this.currentLessonEntries = this.$utils.clone(lessonDraftObservable.entries)
      this.draft.time = { ...lessonDraftObservable.time }
      this.unwatch = this.$watch('draft', () => {
        this.hasUnsavedChanges = true
      }, { deep: true })
    },
    onDismiss () {
      if (this.hasUnsavedChanges) {
        this.$confirm(this.$t('calendar.course_modal.confirm_exit'), () => {
          this.$refs.baseModal.hide()
        })
      } else {
        this.$refs.baseModal.hide()
      }
    },
    onHidden () {
      this.unwatch()
      Object.assign(this.$data, this.$options.data.call(this))
    },
    showCalendarManagerModal (entry) {
      const i = this.entries.indexOf(entry)

      const saveAction = (draft) => {
        this.currentLessonEntries.splice(i, 1, draft)
      }

      this.$refs.calendarManagerModal.show(entry, saveAction)
    },
    removeEntry (index) {
      this.currentLessonEntries.splice(index, 1)
    },
    save () {
      Object.assign(lessonDraftObservable, { entries: this.entries })
      this.$refs.baseModal.hide()
    }
  }
}
</script>
