<template>
  <cw-base-group-broadcast-members
    :source="currentChat"
    :members="members"
    :on-member-activate="onMemberActivate"
    :on-member-suspend="onMemberSuspend"
    :hide-status="$auth.isUser()"
    @show-info="$emit('show-info')"
  />
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    searchText: { type: String, default: '' }
  },
  computed: {
    ...mapState('chat', ['currentChat']),
    currentChatMembers () {
      return this.$store.getters['chat/getCurrentGroupMembers'](this.$auth.user)
    },
    members () {
      return this.currentChatMembers.filter(m => m.profileId !== this.$auth.user._id && (m.displayName ?? m.profileId).toLowerCase().includes(this.searchText.toLowerCase()))
    },
    activeMembers () {
      return this.currentChatMembers.filter(m => m.status === 'active' && (m.displayName ?? m.profileId).toLowerCase().includes(this.searchText.toLowerCase()))
    },
    suspendedMembers () {
      return this.currentChatMembers.filter(m => m.status !== 'active' && (m.displayName ?? m.profileId).toLowerCase().includes(this.searchText.toLowerCase()))
    }
  },
  methods: {
    ...mapActions('chat', ['changeGroupMemberStatus']),
    onMemberActivate (profileId) {
      this.changeGroupMemberStatus({
        chatId: this.currentChat.chatId,
        profileId,
        status: 'active'
      })
    },
    onMemberSuspend (profileId) {
      this.changeGroupMemberStatus({
        chatId: this.currentChat.chatId,
        profileId,
        status: 'suspended'
      })
    }
  }
}
</script>

<style lang="postcss" scoped>
.description {
  @apply text-sm truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 3) and (-webkit-box-orient: vertical) {
    text-overflow: initial;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

.tab {
  @apply w-full;

  &:focus {
    @apply outline-none;
  }

  & span {
    padding-bottom: 2px;
    @apply text-sm text-cw-red font-semibold border-cw-red;
  }
}
</style>
