<template>
  <div
    class="bg-white rounded-full overflow-hidden cursor-pointer flex items-center justify-center group"
    :class="[lg ? 'w-20 h-20' : sm? 'w-10 h-10': 'w-14 h-14']"
    @click="!disabled && inputFile()"
  >
    <img v-if="src" :src="src" class="w-full h-full object-cover">

    <base-icon v-else name="camera-filled" :size="lg ? 40 : 25" class="opacity-75 group-hover:opacity-100" />

    <base-image-editor-modal v-if="!noCrop" ref="editor" @done="onEditorDone" />
  </div>
</template>

<script>
export default {
  props: {
    disabled: Boolean,
    noCrop: Boolean,
    lg: Boolean,
    sm: Boolean,
    value: { type: String, default: null },
    quality: { type: String, default: '0.7' }
  },
  data () {
    return {
      src: this.value,
      tmpFileName: null
    }
  },
  watch: {
    value (v) {
      this.src = v
    }
  },
  methods: {
    async inputFile () {
      const file = await this.$inputFile({ accept: 'image/*' })
      if (!file) {
        return
      }

      const src = await this.$readAsDataURL(file)
      this.tmpFileName = file.name

      if (!this.noCrop) {
        this.$refs.editor.show(src)
      } else {
        this.src = src
        this.$emit('input', src)
        this.$emit('change', { src, file })
      }
    },

    onEditorDone (canvas) {
      this.src = canvas.toDataURL('image/jpeg', this.quality)
      this.$emit('input', this.src)

      if (this.$listeners.change) {
        canvas.toBlob((blob) => {
          blob.lastModifiedDate = new Date()
          blob.name = this.tmpFileName
          blob.url = this.src

          this.$emit('change', { file: blob, src: this.src })
        }, 'image/jpeg', this.quality)
      }
    }
  }
}
</script>
