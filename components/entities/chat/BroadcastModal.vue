<template>
  <cw-base-group-broadcast-modal
    ref="modal"
    :modal-type="$t('chat.broadcast_modal.broadcast')"
    :get-action="getBroadcast"
    :create-action="createBroadcast"
    :update-action="updateBroadcast"
    :name-field-label="$t('chat.broadcast_modal.name_label')"
    :name-field-tooltip="$t('chat.broadcast_modal.name_tooltip')"
    :description-field-tooltip="$t('chat.broadcast_modal.description_tooltip')"
  />
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('chat', ['getBroadcast', 'createBroadcast', 'updateBroadcast']),

    show (broadcast) {
      this.$refs.modal.show(broadcast)
    }
  }
}
</script>
