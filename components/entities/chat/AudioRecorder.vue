<template>
  <div>
    <!-- mobile view -->
    <div ref="mobileWrapper" class="relative flex justify-between items-center px-6 lg:hidden">
      <div class="flex items-center" style="width: 70px">
        <svg class="stroke-current fill-current text-cw-red w-4 h-6" :class="{ blink: isRecording }">
          <use href="#audio-recorder-microphone-icon" />
        </svg>
        <span class="text-xl font-semibold ml-3">{{ duration }}</span>
      </div>
      <div v-if="isRecording && !isLocked" class="flex items-center text-gray-750 text-opacity-50">
        <span class="text-sm">{{ $t('chat.audio_recorder.swipe_to_cancel') }}</span>
        <base-icon name="chevron-left" class="ml-2" />
      </div>
      <button v-if="isRecording && isLocked" class="text-blue font-semibold focus:outline-none" @click="cancelRecording">
        {{ $t('chat.audio_recorder.cancel') }}
      </button>
      <button v-if="!isLocked" class="focus:outline-none">
        <svg class="stroke-current text-blue w-4 h-6" style="fill: none">
          <use href="#audio-recorder-microphone-icon" />
        </svg>
      </button>
      <button
        v-else
        class="flex justify-center items-center bg-blue text-white p-2 rounded-full focus:outline-none"
        @click="finishRecording"
      >
        <svg class="stroke-current text-blue w-4 h-4" style="fill: white">
          <use href="#audio-recorder-send-icon" />
        </svg>
      </button>

      <transition
        enter-class="max-h-0"
        enter-to-class="max-h-120px"
        :leave-class="isLocked ? 'padlock-animation' : 'max-h-120px'"
        :leave-to-class="isLocked ? 'padlock-animation' : 'max-h-0'"
      >
        <div v-if="isPadlockShown" class="padlock-wrapper">
          <div
            class="relative flex flex-col items-center bg-gray-150 bg-opacity-90 text-gray-750 text-opacity-50 w-full pt-4 transform transition-all duration-300 rounded-t-full"
            :class="[isLocked ? 'h-16 rounded-b-full' : 'h-30']"
            @transitionstart="isPadlockShown = false"
          >
            <template v-if="!isLocked">
              <base-icon name="unlock" :size="32" />
              <base-icon name="chevron-up" class="mt-3" />
            </template>
            <base-icon v-else name="lock" class="text-blue" :size="32" />
          </div>
        </div>
      </transition>
    </div>

    <!-- desktop view -->
    <div class="hidden items-center h-full space-x-10 lg:flex">
      <button class="focus:outline-none" @click="cancelRecording">
        <base-icon name="record-cancel" :size="32" />
      </button>
      <div class="duration-lg" :class="{ recording: isRecording }">
        <span class="text-xl font-semibold">{{ duration }}</span>
      </div>
      <button class="focus:outline-none" @click="finishRecording">
        <base-icon name="record-finish" :size="32" />
      </button>
    </div>

    <!-- SVG ICONS -->
    <svg xmlns="http://www.w3.org/2000/svg" class="hidden">
      <!-- microphone -->
      <symbol id="audio-recorder-microphone-icon" viewBox="0 0 18 30">
        <g transform="translate(1)" stroke-width="1.5" fill-rule="evenodd">
          <rect x="3.041" y=".75" width="9.75" height="21.776" rx="4.875" />
          <path fill="none" d="M0 15.513c-.05 6.612 2.59 9.918 7.916 9.918 5.326 0 7.893-3.306 7.701-9.918M7.916 25.43v3.784M5.096 29.214h5.926" />
        </g>
      </symbol>

      <!-- send -->
      <symbol id="audio-recorder-send-icon" viewBox="0 0 25 22">
        <path d="M4 11.5L.798 19.906a1 1 0 001.293 1.29l21.7-8.346a1 1 0 00.06-1.842L2.137.986A1 1 0 00.773 2.223L4 11.5h9.211H4z" stroke-linejoin="round" fill-rule="evenodd" />
      </symbol>
    </svg>
  </div>
</template>

<script>
/* eslint-disable no-console */
import { RecordRTCPromisesHandler, StereoAudioRecorder } from 'recordrtc'
import { Mp3Encoder } from 'lamejs'

export default {
  props: {
    mic: { type: MediaStream, required: true }
  },
  data: () => ({
    startTimeStamp: null,
    setIntervalId: null,
    setTimeoutId: null,
    duration: '0:00',
    isPadlockShown: false,
    isLocked: false
  }),
  computed: {
    isRecording () {
      return !!this.setIntervalId
    }
  },
  mounted () {
    // Adapted from the demo here:
    // https://github.com/muaz-khan/RecordRTC/blob/master/simple-demos/audio-recording.html

    const options = {
      type: 'audio',
      recorderType: StereoAudioRecorder,
      // numberOfAudioChannels: isEdge ? 1 : 2,
      numberOfAudioChannels: 1,
      checkForInactiveTracks: true,
      bufferSize: 16384
    }

    if (navigator.platform && !navigator.platform.toString().toLowerCase().includes('win')) {
      options.sampleRate = 48000 // or 44100 or remove this line for default
    }

    if (this.$utils.isSafari) {
      options.sampleRate = 44100
      options.bufferSize = 4096
      // options.numberOfAudioChannels = 2
    }

    const recorder = this.recorder = new RecordRTCPromisesHandler(this.mic, options)
    recorder.recordRTC.setRecordingDuration(5 * 60 * 1000) // 5 mins
      .onRecordingStopped(this.onRecordingStopped)

    this.$on('hook:beforeDestroy', () => {
      this.resetState()
      recorder.destroy()
    })
  },
  methods: {
    resetState () {
      if (this.setIntervalId) {
        window.clearInterval(this.setIntervalId)
      }
      if (this.setTimeoutId) {
        window.clearTimeout(this.setTimeoutId)
      }
      Object.assign(this.$data, this.$options.data.call(this))
    },
    lock () {
      this.isLocked = true
    },
    startRecording () {
      if (this.recorder) {
        this.startTimeStamp = Date.now()
        this.recorder.startRecording()

        this.setIntervalId = window.setInterval(() => {
          const timeElapsed = new Date(Date.now() - this.startTimeStamp)
          // considering we're only allowing 5 mins max recording time
          this.duration = `${timeElapsed.getUTCMinutes()}:${timeElapsed.getUTCSeconds().toString().padStart(2, '0')}`
        }, 1000)

        this.setTimeoutId = window.setTimeout(() => {
          this.isPadlockShown = true
        }, 2000)
      }
    },
    cancelRecording () {
      this.resetState()
      this.recorder?.destroy()
      this.$emit('cancel')
    },
    finishRecording () {
      if (this.isRecording) {
        this.resetState()
        this.recorder?.stopRecording()
          .then(this.onRecordingStopped)
      }
    },
    finishRecordingIfNotLocked () {
      window.clearTimeout(this.setTimeoutId)
      if (!this.isLocked) {
        this.finishRecording()
      }
    },
    async onRecordingStopped () {
      this.resetState()
      const blob = await this.recorder.getBlob()
      const fr = new FileReader()

      fr.readAsArrayBuffer(blob)
      fr.onload = async () => {
        // Please refer to the example here: https://github.com/zhuker/lamejs

        const channels = 1 // 1 for mono or 2 for stereo
        const sampleRate = 44100 // 44.1khz (normal mp3 samplerate)
        const kbps = 96 // encode 96kbps mp3
        const mp3encoder = new Mp3Encoder(channels, sampleRate, kbps)
        const mp3Data = []

        const samples = new Int16Array(fr.result, 0, Math.floor(fr.result.byteLength / 2))
        const sampleBlockSize = 1152 // can be anything but make it a multiple of 576 to make encoders life easier

        for (let i = 0; i < samples.length; i += sampleBlockSize) {
          const sampleChunk = samples.subarray(i, i + sampleBlockSize)
          const mp3buf = mp3encoder.encodeBuffer(sampleChunk)
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf)
          }
        }
        const mp3buf = mp3encoder.flush() // finish writing mp3

        if (mp3buf.length > 0) {
          mp3Data.push(new Int8Array(mp3buf))
        }

        const blob = new Blob(mp3Data, { type: 'audio/mp3' })
        const base64 = await this.$utils.readFile(blob, 'base64')
        this.$emit('done', base64)
      }
      fr.onerror = () => {
        console.error('error compressing audio recording')
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
@keyframes fade-in-fade-out {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes scale-up-fade-out {
  33% {
    transform: translateY(-100%) scale(1.5);
  }
  66% {
    transform: translateY(-100%) scale(1.5);
    opacity: 1;
  }
  100% {
    transform: translateY(-100%) scale(1.5);
    opacity: 0;
  }
}

.max-h-120px {
  max-height: 120px;
}

.blink {
  animation-name: fade-in-fade-out;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}

.padlock-wrapper {
  margin-top: -8px;
  @apply absolute right-0 top-0 w-16 h-30 overflow-hidden transform -translate-y-full transition-max-height duration-300;
}

.padlock-animation {
  animation-name: scale-up-fade-out;
  animation-duration: 1.67s;
}

.duration-lg {
  width: 7ch;
  @apply relative text-right flex-shrink-0;

  &::before {
    content: '';
    width: 14px;
    height: 14px;
    top: 50%;
    @apply absolute left-0 rounded-full bg-cw-red transform -translate-y-1/2;
  }

  &.recording::before {
    @apply blink;
  }
}
</style>
