<template>
  <div
    v-if="source"
    class="base-tease relative flex items-center h-18 pl-5 pr-4 text-xs text-gray-750 lg:h-24 lg:pl-3 lg:pr-8 lg:text-base transition duration-150 ease-in-out"
    :class="{ 'bg-white': isActive }"
  >
    <div class="flex items-center w-full">
      <cw-profile-avatar
        :src="$utils.getAvatarUrl(source.avatar, 'group')"
        :size="isMobileOrTablet ? 10 : 14"
        :alt="source.name"
      />
      <div class="min-w-0 w-full">
        <div class="ml-3">
          <div class="flex justify-between items-center">
            <div class="font-poppins-bold pr-2 truncate">
              {{ source.displayName }}
            </div>
            <span v-if="lastMessage" class="flex justify-center items-center flex-shrink-0 w-10 text-opacity-50 text-gray-750 text-xs" :style="{ fontSize: isMobileOrTablet ? '10px' : null}">{{ lastMessageDate }}</span>
          </div>
          <div v-if="lastMessage && lastMessage.frontId" class="flex items-center mt-2 lastmessage">
            <div v-if="!lastMessage._id || lastMessage.toProfileId !== $auth.user._id && lastMessage._id">
              <base-icon v-if="!lastMessage._id" class="opacity-50 ml-1 mr-2" name="clock" />
              <cw-chat-ticks v-if="lastMessage.toProfileId !== $auth.user._id && lastMessage._id" class="flex-shrink-0 transform scale-75 opacity-60" :delivered="lastMessage.isDelivered" :read="lastMessage.isViewed" />
            </div>
            <span v-if="lastMessage.content && lastMessage.content.type === 'text'" class="ml-1 truncate" v-text="$utils.stripHtml(lastMessageText)" />
            <span v-if="lastMessage.content && lastMessage.content.type === 'audio'" class="ml-1 truncate">
              <base-icon name="microphone" size="16" />
              {{ lastMessageText }}
            </span>
            <span v-if="lastMessage.content && lastMessage.content.type === 'image'" class="ml-1 truncate">
              <base-icon name="camera" size="16" />
              {{ lastMessageText }}
            </span>
            <div class="badge">
              <svg class="stroke-current w-3 h-3 lg:w-5 lg:h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <g transform="translate(1 1)" stroke-width="1.5" fill="none" fill-rule="evenodd">
                  <path d="M.492 29.78h29.2v-7.329c0-1.962-1.802-3.553-4.025-3.553H4.518c-2.223 0-4.026 1.59-4.026 3.553v7.33z" />
                  <circle cx="14.729" cy="6.689" r="6" />
                </g>
              </svg>
              <!-- TODO: Get size of broadcast audience -->
              <span class="text-xs ml-1">{{ audienceSize }}</span>
            </div>
          </div>
          <div v-if="false" class="flex items-center mt-2">
            <cw-broadcast-tag v-for="({ id, text, value }) in firstFourTags" :key="id" class="tag" :type="value.type">
              {{ text }}
            </cw-broadcast-tag>
            <cw-broadcast-tag v-if="filterTags.length > 4" class="tag">
              +{{ filterTags.length - 4 }}
            </cw-broadcast-tag>
            <div class="flex items-center text-gray-750 text-opacity-75">
              <svg class="stroke-current w-3 h-3 lg:w-5 lg:h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <g transform="translate(1 1)" stroke-width="1.5" fill="none" fill-rule="evenodd">
                  <path d="M.492 29.78h29.2v-7.329c0-1.962-1.802-3.553-4.025-3.553H4.518c-2.223 0-4.026 1.59-4.026 3.553v7.33z" />
                  <circle cx="14.729" cy="6.689" r="6" />
                </g>
              </svg>
              <!-- TODO: Get size of broadcast audience -->
              <span class="text-xs ml-1">{{ audienceSize }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import FilterMixin from '@/mixins/FilterMixin'

export default {
  mixins: [FilterMixin],
  props: {
    source: { type: Object, required: true }
  },
  computed: {
    ...mapState('chat', ['currentChat']),
    isActive () {
      return this.currentChat?._id === this.source._id
    },

    firstFourTags () {
      return this.filterTags.slice(0, 4)
    },

    audienceSize () {
      return this.source.filter?.profiles?.length ?? 0
    },

    lastMessage () {
      return this.source?.lastMessage || null
    },

    lastMessageText () {
      return this.lastMessage?.content?.text || ''
    },

    lastMessageDate () {
      try {
        return this.$utils.getHumanDateOrTime(this.lastMessage.createdAt)
      } catch {
        return ''
      }
    },

    isMobileOrTablet () {
      return ['mobile', 'tablet'].includes(this.$mq)
    }
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

.lastmessage {
  flex: 1 0 auto;
}

.badge {
  min-width: 2rem;
  @apply flex items-center justify-center h-8 text-gray-750 text-opacity-75 ml-auto;
}

.tag {
  @apply min-w-0 mr-1 mt-1;
}
</style>
