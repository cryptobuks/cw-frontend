<template>
  <div class="w-full px-2 py-1">
    <div class="border-b border-black border-opacity-25 pb-1">
      <div ref="text" :class="{ 'truncate-text': !isTextExpanded }" v-html="text" />
      <a v-show="isTextTruncated && !isTextExpanded" class="text-sm text-blue cursor-pointer focus:outline-none" @click="loadMore()">
        {{ $t('chat.read_more') }}
      </a>
      <a v-if="isTextTruncated && isTextExpanded" class="text-blue cursor-pointer" @click="isTextExpanded = false">
        {{ $t('chat.read_less') }}
      </a>
    </div>

    <div class="text-xs mt-1">
      <div class="flex items-top">
        <span class="font-bold">Subject:</span>
        <span class="ml-1"> {{ source.content.subject }}</span>
      </div>
      <div v-if="source.content.from" class="flex items-top">
        <span class="font-bold">From:</span>
        <span class="ml-1"> {{ source.content.from }}</span>
      </div>
      <div v-if="source.content.to && source.content.to.length>1" class="flex items-top">
        <span class="font-bold">To:</span>
        <!-- temp remove comma -->
        <span class="ml-1"> {{ source.content.to.map(e=>e.replace(',','')).join(', ') }}</span>
      </div>

      <div v-if="source.content.cc && source.content.cc.length" class="flex items-top">
        <span class="font-bold">Cc:</span>
        <!-- temp remove comma -->
        <span class="ml-1"> {{ source.content.cc.map(e=>e.replace(',','')).join(', ') }}</span>
      </div>

      <div class="flex">
        <div class="font-bold">
          Files:
        </div>
        <div class="files-wrapper">
          <button class="flex flex-col items-center focus:outline-none" @mouseover="loadEmail" @click="showEmail">
            <img src="~/assets/icons/mail.svg" alt="email" style="height: 26px">
            <span>Email</span>
          </button>
          <button
            v-for="({ filename, attachmentId, icon }) in attachments"
            :key="attachmentId"
            class="flex flex-col items-center focus:outline-none"
            @click="downloadAttachment(attachmentId)"
          >
            <img :src="icon" :alt="filename">
            <span class="w-full truncate">{{ filename }}</span>
          </button>
        </div>
      </div>
    </div>

    <cw-email-popup
      v-if="showEmailPopup"
      v-model="showEmailPopup"
      :source="source"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    source: { type: Object, required: true }
  },

  data: () => ({
    isTextExpanded: false,
    isTextTruncated: null,
    showEmailPopup: false,
    loading: false,

    icons: {
      txt: require('~/assets/icons/file-types/txt.svg'),
      csv: require('~/assets/icons/file-types/csv.svg'),
      pdf: require('~/assets/icons/file-types/pdf.svg'),
      doc: require('~/assets/icons/file-types/doc.svg'),
      xls: require('~/assets/icons/file-types/xls.svg'),
      ppt: require('~/assets/icons/file-types/ppt.svg'),
      odt: require('~/assets/icons/file-types/odt.svg'),
      ods: require('~/assets/icons/file-types/ods.svg'),
      odp: require('~/assets/icons/file-types/odp.svg'),
      zip: require('~/assets/icons/file-types/zip.svg'),
      rar: require('~/assets/icons/file-types/rar.svg'),
      file: require('~/assets/icons/file-types/file.svg')
    }
  }),

  computed: {
    from () {
      const { firstname, lastname } = this.$store.state.chat.friends[this.source.fromProfileId]
      return `${firstname || ''} ${lastname || ''}`
    },

    text () {
      return this.source?.content?.text.replace(/\n/g, '<br>') || ''
    },

    attachments () {
      return this.source.content.attachments.map((attachment) => {
        const { mimeType } = attachment

        let icon = ''

        switch (mimeType) {
          case 'text/plain':
            icon = this.icons.txt
            break
          case 'text/csv':
            icon = this.icons.csv
            break
          case 'application/pdf':
            icon = this.icons.pdf
            break

          case 'application/msword':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            icon = this.icons.doc
            break
          case 'application/vnd.ms-excel':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            icon = this.icons.xls
            break
          case 'application/vnd.ms-powerpoint':
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            icon = this.icons.ppt
            break

          case 'application/vnd.oasis.opendocument.text':
            icon = this.icons.odt
            break
          case 'application/vnd.oasis.opendocument.spreadsheet':
            icon = this.icons.ods
            break
          case 'application/vnd.oasis.opendocument.presentation':
            icon = this.icons.odp
            break

          case 'application/zip':
            icon = this.icons.zip
            break
          case 'application/vnd.rar':
            icon = this.icons.rar
            break

          default:
            icon = this.icons.file
        }

        return { ...attachment, icon }
      })
    }
  },

  mounted () {
    const el = this.$refs.text
    this.isTextTruncated = el.scrollHeight > el.clientHeight
  },

  methods: {
    ...mapActions('chat', ['loadMessage', 'getAttachment']),
    async loadMore () {
      await this.loadEmail()
      this.isTextExpanded = true
    },
    loadEmail () {
      if (!this.loading && !this.source.content.html) {
        this.loading = true
        return this.loadMessage({ messageId: this.source._id })
      }
    },
    showEmail () {
      this.loadEmail()
      this.showEmailPopup = true
    },
    downloadAttachment (attachmentId) {
      this.getAttachment({
        messageId: this.source._id,
        attachmentId
      })
        .then((res) => {
          const { mimeType, base64, filename } = res.data?.attachment ?? {}

          if (mimeType && base64) {
            const el = document.createElement('a')
            el.href = `data:${mimeType};base64,${base64}`
            el.target = '_blank'
            el.download = filename ?? 'attachment'
            el.click()
            el.remove()
          }
        })
    }
  }
}
</script>

<style lang="postcss" scoped>
.truncate-text {
  @apply truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 12) and (-webkit-box-orient: vertical) {
    text-overflow: initial;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 12;
    -webkit-box-orient: vertical;
  }
}

.files-wrapper {
  @apply grid gap-3 w-full pt-5;
  grid-template-columns: repeat(auto-fit, minmax(50px, max-content));
  min-width: 108px;
}
</style>
