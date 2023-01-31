<template>
  <cw-base-group-broadcast-modal
    ref="modal"
    :modal-type="$t('chat.group_modal.group')"
    :get-action="getGroup"
    :create-action="createGroup"
    :update-action="updateGroup"
    :name-field-label="$t('chat.group_modal.name_label')"
    :name-field-tooltip="$t('chat.group_modal.name_tooltip')"
    :description-field-tooltip="$t('chat.group_modal.description_tooltip')"
  />
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('chat', ['getGroup', 'createGroup', 'updateGroup']),

    show (group) {
      this.$refs.modal.show(group)
    }
  }
}
</script>
