<template>
  <div
    v-if="chat"
    class="base-tease relative flex items-center h-18 pl-5 pr-4 text-xs text-gray-750 lg:h-24 lg:pl-3 lg:pr-8 lg:text-base transition duration-150 ease-in-out"
    :class="{ 'bg-white': isActive }"
  >
    <div class="flex items-center w-full">
      <!-- TODO: Show default avatar for contacts who don't have a profile photo. -->
      <cw-profile-avatar
        :src="avatarUrl"
        :size="isMobileOrTablet ? 10 : 14"
        :is-online="chat.type === 'chat' ? friend.status : null"
        border="#d7d7d8"
      />
      <div class="min-w-0 w-full">
        <div class="ml-3">
          <div class="flex justify-between items-center">
            <text-highlight v-if="query" class="font-poppins-bold pr-2 truncate" :queries="query" highlight-class="match">
              {{ chat && chat.displayName }}
            </text-highlight>
            <div v-if="!query" class="font-poppins-bold pr-2 truncate">
              {{ chat && chat.displayName }}
            </div>
            <span v-if="lastMessage" class="flex justify-center items-center flex-shrink-0 w-10 text-opacity-50 text-gray-750 text-xs" :style="{ fontSize: isMobileOrTablet ? '10px' : null}">{{ lastMessageDate }}</span>
          </div>
          <div v-if="lastMessage && lastMessage.frontId" class="flex items-center mt-2 lastmessage">
            <div v-if="!lastMessage._id || lastMessage.toProfileId !== $auth.user._id && lastMessage._id">
              <base-icon v-if="!lastMessage._id" class="opacity-50 ml-1 mr-2" name="clock" />
              <cw-chat-ticks v-if="lastMessage.toProfileId !== $auth.user._id && lastMessage._id" class="flex-shrink-0 transform scale-75 opacity-60" :delivered="lastMessage.isDelivered" :read="lastMessage.isViewed" />
            </div>
            <span v-if="lastMessage.content && ['text', 'action'].includes(lastMessage.content.type)" class="ml-1 truncate" v-text="$utils.stripHtml(lastMessageText)" />
            <span v-if="lastMessage.content && lastMessage.content.type === 'audio'" class="ml-1 truncate">
              <base-icon name="microphone" size="16" />
              {{ lastMessageText }}
            </span>
            <span v-if="lastMessage.content && lastMessage.content.type === 'image'" class="ml-1 truncate">
              <base-icon name="camera" size="16" />
              {{ lastMessageText }}
            </span>
            <span v-if="lastMessage.content && lastMessage.content.type === 'file'" class="ml-1 truncate">
              <base-icon name="document" size="16" />
              {{ lastMessageText }}
            </span>
            <span
              v-if="stats"
              v-show="$auth.isBusiness() && chat.type === 'chat' && stats.notManaged > 0 || stats.notViewed > 0"
              class="badge"
              :class="{ 'read-unanswered-status': stats.notManaged, 'unread-status': stats.notViewed}"
            >
              {{ stats.notViewed ? stats.notViewed : stats.notManaged }}
            </span>
          </div>
          <div v-else class="flex items-center mt-2 lastmessage">
            <span class="ml-1 truncate">&nbsp;</span>
          </div>
        </div>
      </div>
    </div>
    <svg class="flex-shrink-0 fill-current text-gray-750 text-opacity-50 w-2 h-2 md:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
      <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
    </svg>
  </div>
</template>

<script>
import TextHighlight from 'vue-text-highlight'

export default {
  components: {
    TextHighlight
  },

  props: {
    chat: { type: Object, default: null },
    isActive: { type: Boolean, defailt: false }
  },

  computed: {
    query () {
      const query = this.$store.getters['chat/getGlobalSearchQuery']
      if (query.length > 2) {
        return query
      }
      return null
    },

    avatarUrl () {
      let type = this.chat.type
      if ((this.chat.chatId).startsWith('S-')) {
        type = 'system'
      }
      return this.$utils.getAvatarUrl(this.chat.avatar, type)
    },

    friend () {
      if (this.chat.type !== 'chat') { return null }
      return this.$store.getters['chat/getFriend'](this.chat.profileId)
    },

    messages () {
      return this.$store.getters['chat/getMessagesOrderedByCreatedAt'](this.chat)
    },

    lastMessage () {
      return this.chat.lastMessage
    },

    lastMessageText () {
      if (this.lastMessage?.content?.type) {
        if (['text', 'action'].includes(this.lastMessage.content.type)) {
          return this.lastMessage.content.text
        }
        if (this.lastMessage.content.type === 'audio') {
          return ''
        }
        if (this.lastMessage.content.type === 'image') {
          return this.$t('chat.photo')
        }
        if (this.lastMessage.content.type === 'file') {
          return this.lastMessage.content.text || this.lastMessage.content.filename
        }
      }
      return ''
    },

    lastMessageDate () {
      try {
        return this.$utils.getHumanDateOrTime(this.lastMessage.createdAt)
      } catch {
        return ''
      }
    },

    stats () {
      return this.$store.getters['chat/countMessagesNotManagedAndNotReaded'](this.chat, this.$auth)
    },

    isMobileOrTablet () {
      return ['mobile', 'tablet'].includes(this.$mq)
    }
  },

  methods: {
  }
}
</script>

<style lang="scss" scoped>
.base-tease {
  cursor: pointer;
  @apply border-b border-gray-750 border-opacity-25;

  &:hover {
    @apply bg-white;
  }
}

.read-unanswered-status {
  @apply bg-cw-red;
}

.unread-status {
  background-color: #68d79b;
}

.lastmessage {
  flex: 1 0 auto;
}

.badge {
  min-width: 1.75rem;
  @apply flex items-center justify-center w-7 h-7 text-white  text-sm rounded-full ml-auto;
}

::v-deep .match {
  @apply text-cw-red bg-transparent font-semibold;
}

</style>
