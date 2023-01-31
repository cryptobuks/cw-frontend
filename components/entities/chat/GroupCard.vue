<template>
  <cw-base-group-broadcast-card
    v-bind="$attrs"
    :mode="mode"
    :title="mode === 'MEMBERS' ? $t('chat.group_card.group') : $t('chat.group_card.group_info')"
    :edit-tooltip="$t('chat.group_card.edit_group')"
    @edit="$emit('edit')"
    @dismiss="$emit('dismiss')"
    @back="mode = 'MEMBERS'"
  >
    <template #default="{ searchText }">
      <component :is="mode === 'MEMBERS' ? 'GroupMembers' : 'GroupInfo'" :search-text="searchText" @show-info="mode = 'INFO'" />
    </template>
  </cw-base-group-broadcast-card>
</template>

<script>
import GroupMembers from './GroupMembers'
import GroupInfo from './GroupInfo'

export default {
  components: {
    GroupMembers,
    GroupInfo
  },
  data: () => ({
    mode: 'MEMBERS'
  })
}
</script>
