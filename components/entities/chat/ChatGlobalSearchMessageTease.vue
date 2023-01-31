<template>
  <div v-if="message" class="base-search-result">
    <div class="flex justify-between items-center leading-none">
      <span class="font-poppins-bold mr-2 truncate">{{ chat && chat.displayName }}</span>
      <div class="inline-flex items-center flex-shrink-0 text-lg text-gray-750 text-opacity-50">
        <span class="mr-3 text-xs">{{ messageDate }}</span>
        <svg class="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
          <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
        </svg>
      </div>
    </div>
    <div v-if="text" class="flex items-center mt-2">
      <cw-chat-ticks v-if="message.toProfileId !== $auth.user._id && message._id" class="flex-shrink-0 transform scale-75 opacity-60 mr-1" :delivered="message.isDelivered" :read="message.isViewed" />
      <div
        class="message"
        v-html="text"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    message: {
      type: Object,
      default: null
    }
  },

  computed: {
    ...mapGetters('chat', {
      query: 'getGlobalSearchQuery',
      getChatFromMessage: 'getChatFromMessage'
    }),

    chat () {
      return this.getChatFromMessage(this.message)
    },

    messageDate () {
      try {
        return this.$utils.getHumanDateOrTime(this.message.createdAt)
      } catch {
        return ''
      }
    },

    text () {
      if (!this.message || !this.message.content) {
        return null
      }
      const text = this.message.content.text || null
      if (!this.message.highlight['content.text']) {
        return null
      }
      const highlight = (this.message.highlight['content.text'][0].replace('<em>', '')).replace('</em>', '')
      let result = this.message.highlight['content.text'][0]
      if (text.length > highlight.length && !text.startsWith(highlight)) {
        result = `...${result}`
      }
      if (!text.endsWith(highlight)) {
        result = `${result}...`
      }
      return result
    }
  }
}
</script>

<style lang="postcss" scoped>
.base-search-result {
  @apply px-3 py-5 text-base text-gray-750 border-b border-gray-750 border-opacity-25 cursor-pointer;

  &:hover {
    @apply bg-white;
  }
}

.message {
  @apply break-words;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 2) and (-webkit-box-orient: vertical) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @supports not ((display: -webkit-box) and (-webkit-line-clamp: 2) and (-webkit-box-orient: vertical)) {
    @apply truncate;
  }
}

::v-deep em {
  @apply not-italic text-cw-red bg-transparent font-semibold;
}
</style>
