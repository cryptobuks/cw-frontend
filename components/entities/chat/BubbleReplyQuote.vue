<template>
  <div v-if="message" class="quote">
    <span class="name">{{ name }}</span>
    <div class="max-w-full break-words">
      {{ message.content.text }}
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    messageId: { type: String, required: true }
  },
  computed: {
    ...mapState('chat', ['currentChat']),
    ...mapGetters('chat', ['getMessagesOrderedByCreatedAt', 'getFriendFromMessage']),
    message () {
      const currentChatMessages = this.getMessagesOrderedByCreatedAt(this.currentChat)
      return currentChatMessages.find(m => m._id === this.messageId)
    },
    name () {
      if (this.message.fromProfileId === this.$auth.user._id) {
        return this.$t('chat.quote.you')
      } else {
        const friend = this.getFriendFromMessage(this.message)
        return friend.displayName
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.quote {
  @apply relative rounded-lg text-sm pl-4 pr-3 py-1;

  &::before {
    content: '';
    background-color:#ff6c0e;
    width: 6px;
    @apply absolute h-full left-0 top-0 rounded-l-lg;
  }
}

.name {
  color: #ff6c0e;
  @apply font-semibold;
}
</style>
