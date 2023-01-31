<template>
  <base-modal
    v-if="!$pwa.isStandalone"
    v-model="active"
    v-bind="$attrs"
    :title="title"
    class="inline-block fixed left-0 md:left-unset md:right-0 bottom-0 mb-16 md:mb-32 z-20"
    @dismiss="onDismiss"
    @hidden="$emit('done')"
  >
    <template v-if="!$auth.isAuthenticated || $route.path.startsWith('/home')" #activator>
      <base-button :lg="$mq !== 'mobile'" inline class="-ml-1 md:-mr-1">
        {{ $t('install_pwa.app') }} <span class="hidden md:inline ml-1">{{ $t('install_pwa.install') }}</span>

        <base-icon name="download" class="ml-2 text-lg md:text-xl" />
      </base-button>
    </template>

    <div
      v-if="$pwa.supportA2HS || $pwa.supportManualA2HS"
      class="text-center flex flex-col justify-center items-center h-full"
    >
      <template v-if="installedOnce && !ignoreInstalledOnce">
        <p
          class="font-semibold mb-12 md:mb-24 lg:mb-48 text-xl md:text-3xl"
          v-html="$t('install_pwa.installed.text')"
        />

        <div class="text-gray-600 text-lg">
          {{ $t('install_pwa.installed.still_install_before') }}
          <span class="text-white underline cursor-pointer" @click="ignoreInstalledOnce = true">{{ $t('global.here') }}</span>
          {{ $t('install_pwa.installed.still_install_after') }}
        </div>
      </template>

      <template v-else>
        <h1 class="text-xl md:text-3xl pb-32 md:pb-64">
          {{ $t('install_pwa.headline') }}

          <div class="text-lg text-gray-500 mt-2">
            {{ $t('install_pwa.powered_by') }}
          </div>
        </h1>

        <template v-if="$pwa.supportA2HS">
          <div class="w-full md:px-10 lg:px-16 lg:mt-32">
            <base-button xl @click="$pwa.prompt">
              {{ $t('install_pwa.install') }}
            </base-button>
          </div>

          <p class="mt-6 lg:mt-20 text-gray-500">
            {{ $t('install_pwa.have_you_installed') }}
          </p>
        </template>

        <div v-else class="text-center text-2xl leading-loose mt-auto">
          Click <base-icon name="iphone-open-menu" class="text-xl md:text-3xl mx-2" /> and choose<br>
          « Add to Home <base-icon name="iphone-add-to-home" class="text-xl md:text-3xl mx-2" /> »

          <div class="text-center py-5">
            <base-icon name="iphone-arrow-down" class="text-5xl animate-bounce" />
          </div>
        </div>
      </template>
    </div>

    <div v-else class="text-center flex flex-col justify-between items-center h-full">
      <p class="text-center text-2xl" v-html="$t('install_pwa.no_a2hs')" />

      <div class="w-full md:px-10 lg:px-16 mb-4">
        <base-button xl @click="copyLink">
          {{ $t('install_pwa.copy_link') }}
        </base-button>
      </div>
    </div>
  </base-modal>
</template>

<script>
export default {
  inheritAttrs: false,
  data () {
    return {
      ignoreInstalledOnce: false,
      active: false
    }
  },
  computed: {
    title () {
      return (this.$pwa.supportA2HS || this.$pwa.supportManualA2HS) &&
        this.installedOnce &&
        !this.ignoreInstalledOnce
        ? this.$t('install_pwa.installed.title')
        : this.$t('install_pwa.title')
    },
    installedOnce () {
      return !!this.$auth.user?.pwa?.installed
    }
  },
  watch: {
    '$pwa.installed' (installed) {
      if (installed && !this.$pwa.isStandalone) {
        this.active = false

        if (this.$auth.isAuthenticated & !this.$auth.user.pwa?.installed) {
          this.$repos.pwaRepo.installPwa()
        }

        this.$router.push('/pwa/thank-you')
      }
    }
  },
  mounted () {
    if (this.$pwa.isStandalone || this.$auth.user?.pwa?.installed) {
      return this.$emit('done')
    }

    const profileId = this.$auth.user?._id || '_unauthenticated'
    const MAX_REFUSE_COUNT = 5
    const oldPwaState = this.$utils.parseJSON(localStorage.getItem('cw:refuse_pwa_count'))
    const pwaState = {
      ...oldPwaState,
      [profileId]: oldPwaState?.[profileId] || 0
    }

    localStorage.setItem('cw:refuse_pwa_count', JSON.stringify(pwaState))

    if (pwaState[profileId] >= MAX_REFUSE_COUNT) {
      return this.$emit('done')
    }

    this.active = true
  },
  methods: {
    onDismiss () {
      const key = this.$auth.user?._id || '_unauthenticated'
      const pwaState = this.$utils.parseJSON(localStorage.getItem('cw:refuse_pwa_count'))
      localStorage.setItem('cw:refuse_pwa_count', JSON.stringify({
        ...pwaState,
        [key]: 1 + (pwaState?.[key] || 0)
      }))

      this.$emit('done')
      this.active = false
    },
    copyLink () {
      this.$utils.copy(location.href)
      this.$notifier.success('Copied')
    }
  }
}
</script>
