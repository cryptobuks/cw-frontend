<template>
  <div class="h-full w-full flex justify-center items-center">
    <base-modal
      v-model="modalShown"
      :title="$t('install_device.title')"
      persistent
      hide-overlay
      :dismissible="false"
    >
      <div v-if="!canConnect" class="text-center justify-center items-center h-full">
        {{ $t('install_device.already_in_use') }}
      </div>

      <div v-else-if="$pwa.supportA2HS || $pwa.supportManualA2HS" class="text-center flex flex-col justify-center items-center h-full">
        <h1 class="text-3xl pb-32 md:pb-64">
          {{ $t('install_device.headline') }}

          <div class="text-lg text-gray-500 mt-2">
            {{ $t('install_device.powered_by') }}
          </div>
        </h1>

        <div v-if="$pwa.supportA2HS" class="w-full md:px-10 lg:px-16 lg:mt-32">
          <base-button xl @click="$pwa.prompt">
            {{ $t('install_device.install') }}
          </base-button>
        </div>

        <div v-else class="text-center text-2xl leading-loose mt-auto">
          Click <base-icon name="iphone-open-menu" class="text-3xl mx-2" /> and choose<br>
          « Add to Home <base-icon name="iphone-add-to-home" class="text-3xl mx-2" /> »

          <div class="text-center py-5">
            <base-icon name="iphone-arrow-down" class="text-5xl animate-bounce" />
          </div>
        </div>
      </div>

      <div v-else class="text-center flex flex-col justify-between items-center h-full">
        <p class="text-center text-2xl" v-html="$t('install_device.no_a2hs')" />

        <div class="w-full md:px-10 lg:px-16 mb-4">
          <base-button xl @click="copyLink">
            {{ $t('install_device.copy_link') }}
          </base-button>
        </div>
      </div>
    </base-modal>

    <p
      v-if="$pwa.installed"
      class="text-white inline-block text-center text-xl leading-loose"
      v-html="$t('install_device.install_successfully')"
    />
  </div>
</template>

<script>
export default {
  auth: false,
  middleware ({ $pwa, redirect }) {
    if ($pwa.isStandalone) {
      return redirect('/device' + location.search)
    }
  },
  data () {
    return {
      modalShown: false
    }
  },
  computed: {
    canConnect () {
      const { gymId, deviceId, status } = this.$route.query
      return gymId && deviceId && status !== 'connected' && status !== 'disconnected'
    }
  },
  watch: {
    '$pwa.isStandalone': {
      immediate: true,
      handler (isStandalone) {
        if (isStandalone) {
          this.$router.push({
            path: '/device',
            query: this.$route.query
          })
        }
      }
    },
    '$pwa.installed' (installed) {
      if (installed) {
        this.modalShown = false

        const { gymId, deviceId } = this.$route.query
        this.$pwa.setDeviceInfo({ id: deviceId, gymId })
      }
    }
  },
  mounted () {
    if (!this.$pwa.installed) {
      this.modalShown = true
    } else {
      this.closed = true
    }
  },
  methods: {
    copyLink () {
      this.$utils.copy(location.href)
      this.$notifier.success('Copied')
    }
  },
  head () {
    return {
      title: this.$t('pages.install_device')
    }
  }
}
</script>
