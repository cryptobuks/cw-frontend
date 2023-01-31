<template>
  <base-confirm-popup
    ref="confirm"
    title="Choose the trainer to add"
    :actions="[{ text: $t('global.add'), handler: add, bold: true }]"
  >
    <div class="space-y-3 mb-3">
      <!-- <base-checkbox label="New Trainer" /> -->
      <base-checkbox v-for="(trainer, i) in trainers" :key="i" v-model="selectedTrainerIds" :label="trainer.displayName" :value="trainer._id" />
    </div>
  </base-confirm-popup>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    excludedTrainerIds: [],
    selectedTrainerIds: []
  }),
  computed: {
    ...mapState('calendar', { allTrainers: 'trainers' }),
    trainers () {
      // convert to dictionary for faster lookup
      const excludedIds = {}

      this.excludedTrainerIds.forEach((id) => {
        excludedIds[id] = true
      })

      return this.allTrainers.filter(asset => !excludedIds[asset._id])
    }
  },
  methods: {
    show (excludedTrainerIds) {
      // reset state
      Object.assign(this.$data, this.$options.data.call(this))

      this.excludedTrainerIds = excludedTrainerIds

      this.$refs.confirm.show()
    },
    add () {
      if (this.selectedTrainerIds.length) {
        this.$emit('add', this.selectedTrainerIds)
        this.$refs.confirm.hide()
      }
    }
  }
}
</script>
