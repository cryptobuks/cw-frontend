<template>
  <base-main-card
    v-bind="$attrs"
    body-class="flex flex-col bg-gray-150 bg-opacity-90"
    no-title
    full-input-width
    :actions="[
      { icon: 'dismiss', size: 16, handler: closeSearchInChatSidebar }
    ]"
    @search="handleInChatSearch"
  >
    <div>
      <cw-chat-search-in-chat-message-tease
        v-for="(message, index) in searchInChatMessages"
        :key="index"
        :message="message"
        @click.native="goToMessage(message)"
      />
    </div>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    currentChat: { type: Object, default: null }
  },

  computed: {
    searchInChatMessages () {
      return this.$store.getters['chat/getSearchInChatMessagesOrderedByCreatedAt']
    }
  },

  methods: {
    closeSearchInChatSidebar () {
      this.$emit('close')
    },

    handleInChatSearch (event) {
      if (event.length === 0) {
        this.$store.dispatch('chat/setSearchInChatQuery', event)
        this.$store.dispatch('chat/clearSearchInChatMessages')
      }
      if (event.length > 0) {
        this.$store.dispatch('chat/setSearchInChatQuery', event)
        this.$store.dispatch('chat/searchInChatMessages', {
          chatId: this.currentChat.chatId,
          query: event
        })
      }
    },

    goToMessage (message) {
      this.$emit('messageclick', message)
    }
  }
}
</script>
