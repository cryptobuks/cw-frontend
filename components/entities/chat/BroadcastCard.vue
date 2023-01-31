<template>
  <cw-base-group-broadcast-card
    mode="INFO"
    :title="$t('chat.broadcast_card.broadcast_info')"
    :edit-tooltip="$t('chat.broadcast_card.edit_broadcast')"
    hide-back-button
    @edit="$emit('edit')"
    @dismiss="$emit('dismiss')"
  >
    <template #default="{ searchText }">
      <broadcast-info :search-text="searchText" />
    </template>
  </cw-base-group-broadcast-card>
</template>

<script>
import BroadcastInfo from './BroadcastInfo'

export default {
  components: {
    BroadcastInfo
  }
}
</script>
