<template>
  <cw-input-subflow-wrapper
    :items="value"
    v-bind="$attrs"
    @add-item="showModal"
  >
    <cw-add-lesson-modal ref="addLessonModal" :lessons="value" />
    <cw-calendar-manager-modal ref="calendarManagerModal" />

    <template #item="{ item }">
      <cw-lesson-summary-swipe-card
        :lesson="item"
        @edit="edit(item)"
        @remove="remove(item)"
        @edit-entry="editEntry(item, $event)"
        @remove-entry="removeEntry(item, $event)"
      />
    </template>
  </cw-input-subflow-wrapper>
</template>

<script>
export default {
  props: {
    value: { type: Array, required: true }
  },
  methods: {
    showModal () {
      this.$refs.addLessonModal.show()
    },
    edit (lesson) {
      const lessonIndex = this.value.indexOf(lesson)

      this.$refs.addLessonModal.show(lessonIndex)
    },
    remove (lesson) {
      const index = this.value.indexOf(lesson)
      this.value.splice(index, 1)
    },
    editEntry (lesson, entryIndex) {
      const lessonIndex = this.value.indexOf(lesson)

      const saveAction = (draft) => {
        this.value[lessonIndex].entries.splice(entryIndex, 1, draft)
      }

      this.$refs.calendarManagerModal.show(this.value[lessonIndex].entries[entryIndex], saveAction)
    },
    removeEntry (lesson, entryIndex) {
      const lessonIndex = this.value.indexOf(lesson)
      this.value[lessonIndex].entries.splice(entryIndex, 1)
    }
  }
}
</script>
