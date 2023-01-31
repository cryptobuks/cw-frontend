<template>
  <div
    id="chat-input-wrapper"
    ref="inputWrapper"
    class="chat-input-wrapper"
    @dragenter.prevent="onDragEnter"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @dragover.prevent
  >
    <!-- Image Uploader -->
    <image-uploader
      id="image-uploader"
      ref="imageUploader"
      class-name="hidden"
      output-format="string"
      capture="camera"
      :preview="false"
      :auto-rotate="true"
      :max-width="800"
      :max-height="800"
      @input="image = $event"
    >
      <label slot="upload-label" ref="imageUploaderLabel" for="image-uploader" />
    </image-uploader>

    <!-- Dropzone -->
    <div
      v-show="isDropzoneShown"
      class="absolute inset-0 flex justify-center items-center bg-white text-lg text-black text-opacity-95 border-4 border-blue border-dashed"
    >
      {{ $t('chat.input_dropzone') }}
    </div>

    <!-- Image/attachment preview portal -->
    <portal v-if="image || file" to="chat-image-upload-preview-target">
      <button
        class="absolute top-0 right-0 flex justify-center items-center m-3 text-white z-40 focus:outline-none"
        @click="resetInputAfterSend"
      >
        <base-icon name="dismiss" />
      </button>
      <div class="absolute flex flex-col bg-black inset-0 z-30">
        <div class="relative w-full flex justify-center items-center flex-1 min-h-0">
          <img v-if="image" class="max-w-full max-h-full object-contain" :src="image">
          <template v-else>
            <img v-if="file.mimeType.startsWith('image')" class="max-w-full max-h-full object-contain" :src="`data:${file.mimeType};base64,${file.base64}`">
            <embed v-else class="w-full h-full" :src="`data:${file.mimeType};base64,${file.base64}`">
          </template>
          <button
            class="absolute bottom-0 right-0 flex justify-center items-center bg-white p-2 rounded-full transform translate-y-1/2 mr-10 shadow-cw-card focus:outline-none"
            @click="send"
          >
            <base-icon name="send" :size="24" />
          </button>
        </div>
        <div class="w-full bg-black">
          <div class="w-4/5 mx-auto">
            <base-input-text v-model="caption" :placeholder="$t('chat.caption_placeholder')" :clearable="false" />
          </div>
        </div>
      </div>
    </portal>

    <template v-if="!(image || file)">
      <cw-input-reply-quote v-if="replyToMessageId" class="col-start-2 -mt-2" :message-id="replyToMessageId" @dismiss="dismissQuote" />
      <cw-audio-recorder
        v-if="isAudioRecorderShown"
        ref="audioRecorder"
        class="row-start-2 col-start-1 col-span-full lg:col-start-3"
        :mic="mic"
        @done="sendAudioMessage"
        @cancel="isAudioRecorderShown = false"
      />

      <div v-show="!isAudioRecorderShownInMobileOrTablet" class="row-start-2 col-start-1 flex justify-between items-center flex-shrink-0 lg:w-20">
        <button class="icon-base flex lg:hidden" @click="openAddActions">
          <base-icon name="add" alt="add" size="20" />
        </button>
        <base-popover :offset-y="10">
          <template #activator>
            <button class="icon-base hidden lg:flex">
              <base-icon name="add" alt="add" size="20" />
            </button>
          </template>

          <div class="plus-menu-popover">
            <button @click="showImageUploader">
              <base-icon name="camera" alt="camera" />
              <span>{{ $t('chat.input_plus_menu.camera') }}</span>
            </button>
            <label>
              <input type="file" accept="image/jpeg,image/png,image/gif,application/pdf" @change="onDocumentSelected">
              <base-icon name="document" />
              <span>{{ $t('global.document') }}</span>
            </label>
          </div>
        </base-popover>

        <twemoji-picker
          v-if="isEmojiDataLoaded"
          class="chat-emoji-picker"
          :emoji-data="emojiData"
          :emoji-groups="emojiGroups"
          :skins-selection="false"
          :search-emojis-feat="true"
          :search-emoji-placeholder="$t('global.search')"
          :search-emoji-not-found="$t('chat.input_emoji_picker.not_found')"
          :is-loading-label="$t('chat.input_emoji_picker.loading')"
          :picker-width="isMobileOrTablet ? '#chat-input-wrapper' : 350"
          :picker-height="250"
          @emojiUnicodeAdded="onEmojiSelected"
        >
          <template #twemoji-picker-button>
            <button ref="emojiPickerButton" class="icon-base hidden lg:flex">
              <base-icon name="emoji" alt="emoji" size="20" />
            </button>
          </template>
        </twemoji-picker>
        <button v-else class="icon-base hidden lg:flex">
          <base-icon name="emoji" alt="emoji" size="20" />
        </button>
      </div>

      <!-- not use v-model but value+input https://github.com/vuejs/vue/issues/9299#issuecomment-481530279 -->
      <textarea
        v-show="!isAudioRecorderShownInMobileOrTablet"
        ref="chatInput"
        :value="text"
        class="input-field whitespace-pre-wrap"
        :rows="rows"
        maxlength="10000"
        :placeholder="$t('chat.input_placeholder')"
        :disabled="isAudioRecorderShown"
        @input="text = $event.target.value"
        @keydown="keydownHandler"
        @paste="onPaste"
      />

      <button v-if="text.trim().length > 0" class="icon row-start-2 col-start-3 self-center" @click="send">
        <base-icon name="send" alt="send" />
      </button>
      <template v-else>
        <div v-show="!isAudioRecorderShown" class="row-start-2 col-start-3 flex justify-between items-center lg:hidden">
          <button class="icon" @click="showImageUploader">
            <base-icon name="camera" alt="camera" size="20" />
          </button>
          <button class="icon ml-3" @touchstart="showAudioRecorder">
            <base-icon name="microphone" alt="microphone" size="20" />
          </button>
        </div>
        <div v-show="!isAudioRecorderShown" class="row-start-2 col-start-3 hidden lg:grid self-center grid-rows-2 gap-y-1 gap-x-3 xl:grid-rows-1" :class="{ 'grid-cols-2 xl:grid-cols-2': $auth.isUser() || minify, 'grid-cols-4 xl:grid-cols-9': $auth.isBusiness() && !minify }">
          <button class="icon" @click="showImageUploader">
            <base-icon name="camera" alt="camera" size="20" />
          </button>
          <template v-if="$auth.isBusiness() && !minify">
            <button class="icon">
              <base-icon name="delegate" alt="delegate" size="20" />
            </button>
            <button class="icon">
              <base-icon name="dollar-circle" alt="subscription" size="20" />
            </button>
            <button class="icon">
              <base-icon name="calendar" alt="calendar" size="20" />
            </button>
            <button class="icon">
              <base-icon name="clock" alt="training plan" size="20" />
            </button>
            <button class="icon">
              <base-icon name="certificate" alt="certificate" size="20" />
            </button>
            <button class="icon">
              <base-icon name="contract" alt="contract" size="20" />
            </button>
            <button class="icon">
              <base-icon name="like" alt="survey" size="20" />
            </button>
          </template>
          <button class="icon" @click="showAudioRecorder">
            <base-icon name="microphone" alt="microphone" size="20" />
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { TwemojiPicker } from '@kevinfaguiar/vue-twemoji-picker'
import ImageUploader from 'vue-image-upload-resize'
import Hammer from 'hammerjs'
import autosize from 'autosize'
import { isEdge } from '@/plugins/utils'

export default {
  components: {
    TwemojiPicker,
    ImageUploader
  },
  props: {
    toProfileId: { type: String, default: '' },
    minify: { type: Boolean, default: false }
  },

  data () {
    const lang = this.$route.query.language
    const locale = lang === 'en' || lang === 'it' ? lang : 'en'

    return {
      awaiting: false,
      isDropzoneShown: false,
      isTouchActive: false,
      mic: null,
      isAudioRecorderShown: false,
      image: '',
      caption: '',
      audio: '',
      file: null,
      isEmojiDataLoaded: false,
      emojiData: null,
      emojiGroups: null,
      locale
    }
  },

  computed: {
    ...mapState('chat', ['mode', 'currentChat']),
    text: {
      get () {
        const { text } = this.$store.getters['chat/getCurrentDraft']
        return text
      },
      set (value) {
        this.$store.commit('chat/SET_CURRENT_DRAFT', {
          text: value,
          image: this.image,
          audio: this.audio
        })
      }
    },
    isMobileOrTablet () {
      return ['mobile', 'tablet'].includes(this.$mq)
    },
    replyToMessageId () {
      return this.currentChat?.replyToMessageId
    },
    rows () {
      return (this.text || '').split('\n').length
    },
    isAudioRecorderShownInMobileOrTablet () {
      return this.isAudioRecorderShown && ['mobile', 'tablet'].includes(this.$mq)
    }
  },

  watch: {
    currentChat () {
      const { text, image, audio } = this.$store.getters['chat/getCurrentDraft']
      this.text = text || ''
      this.image = image || ''
      this.audio = audio || ''
    },

    text (val) {
      if (this.$refs.chatInput) {
        this.$refs.chatInput.focus()
      }
    }
  },

  async mounted () {
    if (this.isMobileOrTablet) {
      // Register event listeners related to audio recorder for mobile
      const pointerdownHandler = () => {
        this.isTouchActive = true
      }
      const pointerupHandler = () => {
        this.isTouchActive = false
        if (this.isAudioRecorderShown) {
          this.$refs.audioRecorder.finishRecordingIfNotLocked()
        }
      }
      const pointercancelHandler = () => {
        this.isTouchActive = false
      }
      document.addEventListener('pointerdown', pointerdownHandler)
      document.addEventListener('pointerup', pointerupHandler)
      document.addEventListener('pointercancel', pointercancelHandler)

      const hammer = this.hammer = new Hammer(this.$refs.inputWrapper)
      hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 150 })
      hammer.on('panleft', () => {
        if (this.isAudioRecorderShown && !this.$refs.audioRecorder.isLocked) {
          this.$refs.audioRecorder.cancelRecording()
        }
      })
      hammer.on('panup', () => {
        this.$refs.audioRecorder.lock()
      })

      this.$on('hook:beforeDestroy', () => {
        document.removeEventListener('pointerdown', pointerdownHandler)
        document.removeEventListener('pointerup', pointerupHandler)
        document.removeEventListener('pointercancel', pointercancelHandler)
        this.hammer?.destroy()
      })
    }

    // Load emoji data
    const [responseEmojiData, responseGroups] = await Promise.all([
      import('@kevinfaguiar/vue-twemoji-picker/emoji-data/' + this.locale + '/emoji-all-groups.json'),
      import('@kevinfaguiar/vue-twemoji-picker/emoji-data/emoji-groups.json')
    ])

    this.emojiData = responseEmojiData.default
    this.emojiGroups = responseGroups.default
    this.isEmojiDataLoaded = true

    autosize(this.$refs.chatInput)
    this.$on('hook:beforeDestroy', () => {
      autosize.destroy(this.$refs.chatInput)
    })
  },

  methods: {
    ...mapActions('chat', ['sendMessage']),

    keydownHandler (e) {
      const keyCode = e.which || e.keyCode
      if (this.text.trim().length === 0 && keyCode === 32) {
        e.preventDefault()
      }
      if (keyCode === 13 && !e.shiftKey) {
        e.preventDefault()
        if (this.text.trim().length > 0) {
          this.send()
        }
      }
      if (keyCode === 13 && e.shiftKey) {
        e.preventDefault()
        if (this.text.trim().length > 0) {
          this.text += '\n'
        }
      }
    },

    dismissQuote () {
      this.$store.commit('chat/SET_REPLY_TO_MESSAGE_ID', null)
    },

    sendAudioMessage (audio) {
      this.isAudioRecorderShown = false
      this.audio = audio
      this.send()
    },

    send () {
      const d = new Date()
      const yy = d.getFullYear()
      const MM = (d.getMonth() + 1).toString().padStart(2, '0')
      const dd = d.getDate().toString().padStart(2, '0')
      const hh = d.getHours().toString().padStart(2, '0')
      const mm = d.getMinutes().toString().padStart(2, '0')
      const ss = d.getSeconds().toString().padStart(2, '0')
      let content

      if (this.image) {
        content = {
          type: 'image',
          filename: `image_${yy}-${MM}-${dd}_${hh}-${mm}-${ss}.jpg`,
          base64: this.image.split(',')[1],
          text: this.caption.trim()
        }
      } else if (this.audio) {
        content = {
          type: 'audio',
          filename: `audio_${yy}-${MM}-${dd}_${hh}-${mm}-${ss}.mp3`,
          base64: this.audio.split(',')[1]
        }
      } else if (this.file) {
        content = {
          type: 'file',
          ...(this.caption ? { text: this.caption } : null),
          ...this.file
        }
      } else {
        content = {
          type: 'text',
          text: this.text.trim()
        }
      }

      this.sendMessage({
        fromProfileId: this.$auth.user._id,
        fromManagerProfileId: (this.$auth.user._id !== this.$auth.user.loginUser) ? this.$auth.user.loginUser : null,
        content
      }).then(() => {
        this.resetInputAfterSend()
      })

      if (this.replyToMessageId) {
        this.dismissQuote()
      }
    },

    resetInputAfterSend () {
      this.text = ''
      this.image = ''
      this.caption = ''
      this.audio = ''
      this.file = null
      this.$emit('send')
    },

    openAddActions () {
      this.$actionSheet([{
        icon: 'camera',
        text: 'Camera',
        handle: this.showImageUploader
      }],
      [{
        icon: 'document',
        text: this.$t('global.document'),
        handle: () => {
          const el = document.createElement('input')
          el.type = 'file'
          el.accept = 'image/jpeg,image/png,image/gif,application/pdf'
          el.onchange = this.onDocumentSelected
          el.click()
        }
      }],
      [{
        icon: 'emoji',
        text: 'Emoji',
        handle: () => {
          this.$refs.emojiPickerButton.click()
        }
      }],
      [{
        text: 'Annulla'
      }])
    },

    showImageUploader () {
      this.$refs.imageUploaderLabel.click()
    },

    async showAudioRecorder () {
      if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
        // eslint-disable-next-line no-console
        console.error('This browser does not supports WebRTC getUserMedia API.')

        if (navigator.getUserMedia) {
          // eslint-disable-next-line no-console
          console.error('This browser seems to support a deprecated getUserMedia API.')
        }

        return
      }

      try {
        this.mic = await navigator.mediaDevices.getUserMedia({
          audio: isEdge ? true : {
            echoCancellation: false
          }
        })

        this.isAudioRecorderShown = true

        this.$nextTick(() => {
          if (this.isMobileOrTablet && !this.isTouchActive) {
            this.isAudioRecorderShown = false
          } else {
            this.$refs.audioRecorder.startRecording()
          }
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Couldn't access your microphone\n", error)
      }
    },

    onEmojiSelected (e) {
      this.text = this.text.concat(e)
    },

    onDragEnter (e) {
      if (e.dataTransfer.items) {
        const item = e.dataTransfer.items[0]
        if (item.kind === 'file') {
          this.isDropzoneShown = true
        }
      } else {
        const file = e.dataTransfer.files[0]
        if (file) {
          this.isDropzoneShown = true
        }
      }
    },

    onDragLeave (e) {
      if (this.isDropzoneShown) {
        const { top, bottom, left, right } = this.$refs.inputWrapper.getBoundingClientRect()
        const { pageX, pageY } = e
        if (pageX < left || pageX > right || pageY < top || pageY > bottom) {
          this.isDropzoneShown = false
        }
      }
    },

    onDrop (e) {
      // Refer to https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        const item = e.dataTransfer.items[0]
        if (item.kind === 'file') {
          const file = item.getAsFile()

          if (file.type.startsWith('image')) {
            this.$refs.imageUploader.handleFile(file)
          } else {
            this.handleFile(file)
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        const file = e.dataTransfer.files[0]

        if (file.type.startsWith('image')) {
          this.$refs.imageUploader.handleFile(file)
        } else {
          this.handleFile(file)
        }
      }

      this.isDropzoneShown = false
    },

    onPaste (e) {
      // Refer to https://medium.com/@liuzhenglaichn/copy-paste-to-upload-image-ce58b4b223ca
      if (e.clipboardData.items) {
        for (const item of e.clipboardData.items) {
          if (item.kind === 'file') {
            e.preventDefault()
            const file = item.getAsFile()

            if (file.type.startsWith('image')) {
              this.$refs.imageUploader.handleFile(file)
            } else {
              this.handleFile(file)
            }

            break
          }
        }
      } else if (e.clipboardData.files?.length) {
        e.preventDefault()
        const file = e.clipboardData.files[0]

        if (file.type.startsWith('image')) {
          this.$refs.imageUploader.handleFile(file)
        } else {
          this.handleFile(file)
        }
      }
    },

    onDocumentSelected (e) {
      const file = e.target.files[0]
      this.handleFile(file)
    },

    async handleFile (file) {
      const { name: filename, type: mimeType, size } = file
      if (!(/^image\/jpeg|image\/png|image\/gif|application\/pdf$/.test(mimeType))) {
        this.$notifier.error(this.$t('chat.error_unsupported_file_format'))
        return
      }

      if (size > 614400) { // 600 KB
        this.$notifier.error(this.$t('chat.error_file_too_big'))
        return
      }
      const dataUrl = await this.$utils.readFile(file, 'base64')
      const base64 = dataUrl.split(',')[1]
      this.file = { filename, base64, mimeType, size }
    }
  }
}
</script>

<style lang="postcss">
.chat-emoji-picker {
  /* Reset tailwind preflight styles */
  & *,
  & ::before,
  & ::after {
    box-sizing: initial;
  }

  & input {
    line-height: initial;
  }

  & img {
    display: initial;
    max-width: initial;
  }

  /* Adjust appearance */
  & #popper-container {
    @apply shadow-md;
  }

  & #search-header {
    border-radius: 10px !important;
    @apply relative items-center;

    &::before {
      content: '';
      background: url('~assets/icons/search-emojis.svg') center / 20px no-repeat;
      @apply absolute w-5 h-5 left-3 top-1/2 transform -translate-y-1/2;
    }

    & > span {
      @apply hidden;
    }

    & input {
      padding-top: 5px !important;
      padding-bottom: 5px !important;
      margin-left: 45px !important;
      font-size: 18px !important;
    }
  }

  & #emoji-popover-header {
    &::-webkit-scrollbar{
      height: 6px !important;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 6px !important;
      background-color: transparent !important;
    }

    &:hover {
      &::-webkit-scrollbar-thumb {
        background-color: #aaa !important;
        &:hover {
          background-color: #999 !important;
        }
      }
    }
  }

  & .emoji-popover-inner {
    &::-webkit-scrollbar{
      width: 6px !important;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 6px !important;
      background-color: transparent !important;
    }

    &:hover {
      &::-webkit-scrollbar-thumb {
        background-color: #aaa !important;
        &:hover {
          background-color: #999 !important;
        }
      }
    }
  }
}
</style>

<style lang="postcss" scoped>
.chat-input-wrapper {
  @apply relative grid gap-x-3 w-full h-full px-4 mb-1;
  grid-template-rows: min-content 1fr;
  grid-template-columns: max-content 1fr max-content;

  @screen md {
    padding-right: 27px;
    padding-left: 27px;
  }
}

.plus-menu-popover {
  min-width: theme('space.32');
  @apply flex flex-col bg-white bg-opacity-90 rounded px-0 py-1;

  & button,
  & label {
    @apply flex items-center text-left text-xs text-gray-750 px-4 py-2;

    & span {
      @apply ml-2
    }

    & svg {
      @apply flex-shrink-0;
    }

    &:focus {
      @apply outline-none;
    }

    &:hover {
      @apply bg-gray-200 cursor-pointer;
    }
  }

  & input[type="file"] {
    clip: rect(0 0 0 0);
    clip-path: inset(100%);
    @apply absolute w-0 h-0 overflow-hidden;
  }
}

.icon-base {
  width: 26px;
  height: 26px;
  @apply justify-center items-center flex-shrink-0;

  &:focus {
    @apply outline-none;
  }

  @screen lg {
    width: 30px;
    height: 30px;
  }
}

.icon {
  @apply icon-base flex;
}

.input-field {
  min-height: 28px;
  max-height: 120px;
  min-width: 2px;
  scrollbar-width: thin;
  scrollbar-color: var(--thumbBG) var(--scrollbarBG);
  @apply  row-start-2 col-start-2 w-full self-center rounded-10px resize-none font-poppins-light leading-snug bg-white bg-opacity-50 border overflow-y-auto overflow-x-hidden mt-1 pl-6 pr-3 py-1 text-gray-750 text-lg;

  &:focus {
    @apply bg-opacity-100;
  }

  &::-webkit-scrollbar {
    width: 6px;
    opacity: 0.6;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background-color: transparent;
  }

  &:hover,
  &:focus {
    &::-webkit-scrollbar-thumb {
      background-color: #aaa;
      &:hover {
        background-color: #999;
      }
    }
  }

  @screen md {
    min-height: 50px;
    @apply py-3;
  }
}
</style>
