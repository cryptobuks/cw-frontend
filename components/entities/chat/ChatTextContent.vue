<template>
  <div>
    <cw-chat-link-preview v-if="source.content.type !=='image' && linkPreview" :preview="linkPreview" />
    <div class="flex flex-wrap px-2 pt-1">
      <div ref="text" v-set-link-click class="max-w-full whitespace-pre-wrap break-words" :class="{ 'truncate-text': !isTextExpanded }" v-html="message" />
      <a v-if="isTextTruncated && !isTextExpanded" class="text-blue cursor-pointer" @click="loadMore()">
        {{ $t('chat.read_more') }}
      </a>
      <a v-if="isTextTruncated && isTextExpanded" class="text-blue cursor-pointer" @click="isTextExpanded = false">
        {{ $t('chat.read_less') }}
      </a>

      <cw-chat-message-timestamp-ticks class="mt-1 ml-2 -mr-2" :source="source" />
    </div>
  </div>
</template>

<script>

import urlRegexSafe from 'url-regex-safe'

export default {
  directives: {
    setLinkClick: {
      inserted (el, _, vnode) {
        const links = el.querySelectorAll('a')

        for (const link of links) {
          link.addEventListener('click', vnode.context.onLinkClick)
        }
      },
      unbind (el, _, vnode) {
        const links = el.querySelectorAll('a')

        for (const link of links) {
          link.removeEventListener('click', vnode.context.onLinkClick)
        }
      }
    }
  },

  props: {
    source: { type: Object, required: true }
  },

  data: () => ({
    linkPreviews: [],
    isTextExpanded: false,
    isTextTruncated: false
  }),

  computed: {
    message () {
      const msg = this.source?.content?.text || ''
      return this.getUrlPreview(msg)
    },

    linkPreview () {
      return this.linkPreviews[0] || null
    }

  },

  mounted () {
    const el = this.$refs.text
    this.isTextTruncated = el.scrollHeight > el.clientHeight
  },
  methods: {
    loadMore () {
      if (this.source.content.isTruncated) {
        this.$store.dispatch('chat/loadMessage', { messageId: this.source._id })
      }
      this.isTextExpanded = true
    },
    getUrlPreview (message) {
      message = message.replace(/\n/g, '<br>')

      // const regex = new RegExp(/(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+/gm)
      const regex = urlRegexSafe()

      let match = ''
      const splitText = []
      let startIndex = 0
      while ((match = regex.exec(message)) != null) {
        // Skip if match doesn't meet these conditions:
        // 1. come at the very beginning or have a whitespace character before
        // 2. have a whitespace character or no text after
        if (
          !(
            (match.index === 0 || /\s/.test(message.charAt(match.index - 1))) &&
            (match.index + match[0].length === message.length || /\s/.test(message.charAt(match.index + match[0].length)))
          )
        ) {
          continue
        }

        splitText.push({ text: message.substr(startIndex, (match.index - startIndex)), type: 'text' })

        let cleanedLink = message.substr(match.index, (match[0].length))
        cleanedLink = cleanedLink.replace(/^https?:\/\//, '')
        splitText.push({ text: cleanedLink, type: 'link' })

        startIndex = match.index + (match[0].length)
      }
      if (startIndex < message.length) { splitText.push({ text: message.substr(startIndex), type: 'text' }) }
      let ret = ''

      for (let i = 0; i < splitText.length; i++) {
        if (splitText[i].type === 'link') {
          splitText[i].href = splitText[i].text.includes('http://', 'https://') ? splitText[i].text : `https://${splitText[i].text}`
          ret += `<a class="message-link" href="${splitText[i].href}" target="_blank">${splitText[i].text}</a>`
          this.getPreview(splitText[i].text)
        } else {
          ret += splitText[i].text
        }
      }
      return ret
    },

    async getPreview (previewUrl) {
      const payload = await this.$store.dispatch('linkPreview/getPreview', previewUrl)
      const preview = payload?.data?.preview
      if (preview && preview.meta.title) {
        this.linkPreviews.push(preview)
      }
    },

    onLinkClick (e) {
      this.$repos.chatRepo.setMessageClick({ messageId: this.source._id, type: 'link', value: e.target.href })
    }
  }
}
</script>

<style scoped>
.truncate-text {
  @apply truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 2) and (-webkit-box-orient: vertical) {
    text-overflow: initial;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 12;
    -webkit-box-orient: vertical;
  }
}

</style>
