<template>
  <cw-input-subflow-wrapper
    :items="trainers"
    v-bind="$attrs"
    @add-item="showModal"
  >
    <cw-add-trainer-modal ref="addTrainerModal" @add="add" />
  </cw-input-subflow-wrapper>
</template>

<script>
export default {
  data: () => ({
    trainers: []
  }),
  methods: {
    showModal () {
      this.$refs.addTrainerModal.show()
    },
    add (e) {
      this.trainers.push(e)
    },
    remove (item) {
      const index = this.trainers.indexOf(item)
      this.trainers.splice(index, 1)
    }

  }
}
</script>
