<template>
  <div class="base-search-result">
    <span class="text-gray-750 text-opacity-50 text-xs">{{ messageDate }}</span>
    <div class="flex items-center max-w-full mt-2">
      <div v-if="text" class="ml-1 truncate" v-html="text" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: { type: Object, required: true }
  },

  computed: {
    query () {
      return this.$store.getters['chat/getSearchInChatQuery']
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
      const highlight = this.message.highlight && this.message.highlight['content.text'] ? (this.message.highlight['content.text'][0].replace('<em>', '')).replace('</em>', '') : ''
      let result = this.message.highlight && this.message.highlight['content.text'] ? this.message.highlight['content.text'][0] : null
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

<style scoped>
.base-search-result {
  height: 70px;
  @apply flex flex-col justify-center items-start pl-6 pr-8  text-gray-750 border-b border-gray-750 border-opacity-25 cursor-pointer;

  &:hover {
    @apply bg-white;
  }
}

::v-deep em {
  @apply not-italic text-cw-red bg-transparent font-semibold;
}
</style>
