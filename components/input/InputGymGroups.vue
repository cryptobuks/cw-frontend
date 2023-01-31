<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    :items="value"
    :label="$attrs.label || $t('input.gym_groups.label')"
    @add-item="showModal"
    @edit-item="showModal"
  >
    <lazy-cw-gym-modal
      ref="modal"
      group-mode
      :group-gym="gym"
      @done="onGroupDone"
    />

    <template #item="{ item }">
      <cw-invitation-card
        :title="`${item.displayName || item.brand || item.name} (${getGroupTypeText(item)})`"
        @remove="remove(item)"
        @edit="showModal(item)"
      />
    </template>
  </cw-input-subflow-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    gym: { type: Object, required: true }
  },
  methods: {
    async showModal (gym) {
      const gymDetail = gym?._id ? await this.$repos.profileRepo.getGymById(gym._id) : {}
      this.$refs.modal.show(gymDetail)
    },
    onGroupDone (newGym) {
      if (this.gym._id && ['GH', 'CH'].includes(newGym.typeCode)) {
        this.$repos.profileRepo.assignParentId({ parentGymId: newGym._id, gymIds: [this.gym._id] })
      }

      const i = this.value.findIndex(group => group._id === newGym._id)
      if (i === -1) {
        this.value.push(newGym)
      } else {
        this.value.splice(i, 1, newGym)
      }
    },
    remove (item) {
      this.$confirm(this.$t('input.gym_groups.confirm_remove', {
        name: item.displayName || item.brand || item.name,
        type: this.getGroupTypeText(item)
      }), () => {
        this.value.splice(this.value.indexOf(item), 1)
        this.$repos.profileRepo.removeGymParent(item._id)
      })
    },
    getGroupTypeText (gym) {
      return ['CU', 'GU'].includes(gym.typeCode)
        ? 'Unit'
        : ['CH', 'GH'].includes(gym.typeCode)
          ? 'Headquater'
          : 'Branch'
    }
  }
}
</script>
