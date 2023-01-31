<template>
  <a
    :href="$utils.getFileUrl(source.content.fileId, source.content.filename)"
    class="file-content-wrapper"
    :download="source.content.filename"
    @click="setMessageClick"
  >
    <span class="flex flex-col">
      <span class="flex items-center">
        <base-icon :name="`file-types/${fileType === 'pdf' ? 'pdf' : 'file'}`" size="30" />
        <span class="text-xs ml-2">{{ source.content.filename }}</span>
      </span>
      <span class="text-2xs text-black text-opacity-50 mt-2">{{ fileSize }} KB - {{ fileType }} {{ $t('global.file') }}</span>
    </span>
    <base-icon name="download-circle" size="24" class="text-black text-opacity-50 ml-8" />
  </a>
</template>

<script>
export default {
  props: {
    source: { type: Object, required: true }
  },
  computed: {
    fileSize () {
      return `${Math.round((parseInt(this.source.content.size) / 1024 * 100)) / 100}`
    },
    fileType () {
      const { mimeType } = this.source.content
      let ext

      switch (mimeType) {
        case 'image/jpeg':
          ext = 'jpg'
          break
        case 'image/png':
          ext = 'png'
          break
        case 'image/gif':
          ext = 'gif'
          break
        case 'application/pdf':
          ext = 'pdf'
          break
      }

      return ext
    }
  },
  methods: {
    setMessageClick () {
      this.$repos.chatRepo.setMessageClick({ messageId: this.source._id, type: 'download' })
    }
  }
}
</script>

<style lang="scss" scoped>
.file-content-wrapper {
  background-color: rgba(#e5f2dd, 0.95);
  @apply flex justify-between items-center rounded-lg pl-1 pr-3 py-2;
}
</style>
