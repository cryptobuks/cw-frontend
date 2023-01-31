<template>
  <div v-if="message" class="quote">
    <span class="name">{{ name }}</span>
    <div class="quote-text">
      {{ message.content.text }}
    </div>
    <button class="dismiss-btn" @click="$emit('dismiss')">
      <img src="~assets/icons/time-circle.svg">
    </button>
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
        return friend?.displayName || null
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.quote {
  @apply bg-gray-300 relative min-w-0 rounded-lg text-sm pl-4 pr-3 py-1;

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

.quote-text {
  @apply max-w-full text-black text-opacity-60 truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 2) and (-webkit-box-orient: vertical) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
}

.dismiss-btn {
  top: 50%;
  left: 100%;
  @apply absolute w-4 h-4 transform translate-x-2 -translate-y-1/2;

  &:focus {
    @apply outline-none;
  }
}
</style>
