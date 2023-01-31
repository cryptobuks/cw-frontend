<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: `flex flex-col h-full ${!loading ? 'bg-white p-4' : ''}`,
      title: $t('profile.entities.app_background'),
      actions,
      showSearchToggler: true,
      hideSearch: false
    }"
    v-on="$listeners"
    @search="keywords = $event"
  >
    <base-card-loading v-if="loading" />
    <div
      v-else-if="displayedBackgrounds.length > 0"
      class="flex flex-col space-y-4"
    >
      <div
        v-for="background in displayedBackgrounds"
        :key="background._id"
        class="w-full rounded-lg relative min-h-16"
      >
        <img
          :src="`${
            background.files.landscape && background.files.landscape.url
          }?size=sm`"
          :alt="background.name"
          class="w-full rounded-lg"
        >
        <div
          class="absolute bottom-0 flex items-center justify-between p-4 text-white w-full rounded-b-lg"
        >
          <span class="font-bold">{{ background.name }}</span>

          <base-input-radio
            :value="background._id"
            :result="backgroundId"
            @change="setBackground(background)"
          />
        </div>
      </div>
    </div>
    <div v-else class="h-full flex justify-center items-center">
      <h5 class="text-sm font-extrabold">
        {{ $t('contract.not_found') }}
      </h5>
    </div>

    <template #footer>
      <div class="bg-gray-300 pr-4 py-2 flex items-center">
        <button
          class="ml-3 py-2 mx-auto bg-white w-full text-center rounded-lg focus:outline-none capitalize"
          @click="requestCustomBackgroundHandler"
        >
          {{ $t('profile.entities.request_custom_background') }}
        </button>
      </div>
    </template>
    <cw-background-image-maker ref="backgroundImageMaker" />
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  inheritAttrs: false,
  props: { profile: { type: Object, required: true } },
  data: () => ({
    backgrounds: [],
    backgroundId: null,
    keywords: '',
    loading: true,
    rendered: false
  }),
  computed: {
    ...mapGetters('settings', ['sportInterests']),
    actions () {
      return this.$auth.user.typeCode === 'CH'
        ? [
          {
            icon: 'add',
            handler: () => this.$refs.backgroundImageMaker.show()
          }
        ]
        : []
    },
    displayedBackgrounds () {
      const sportIds = this.sportInterests
        .filter(
          i =>
            !!Object.values(i.translations).find(name =>
              name.toLowerCase().match(this.keywords.toLowerCase())
            )
        )
        .map(i => i._id)

      const backgrounds = this.backgrounds
        .filter(
          bg =>
            (bg.files.landscape &&
              bg.name.toLowerCase().match(this.keywords.toLowerCase())) ||
            sportIds.some(id => bg.sportIds.includes(id))
        )
        .sort((a, b) => {
          const byBackground = this.rendered
            ? 0
            : (b._id === this.backgroundId) - (a._id === this.backgroundId)
          const byName = a.name < b.name ? -1 : a.name > b.name ? 1 : 0
          return byBackground || byName
        })
      return backgrounds
    }
  },
  created () {
    this.getBackgrounds()
    if (!this.sportInterests?.length) {
      this.getSportInterests()
    }
  },
  methods: {
    ...mapActions('chat', ['sendMessage']),
    ...mapMutations({
      setCurrentDraft: 'chat/SET_CURRENT_DRAFT'
    }),
    ...mapActions('profile', ['getProfile']),
    ...mapActions('settings', ['getSportInterests']),
    async setBackground (background) {
      this.rendered = true
      this.backgroundId = background._id
      if (this.$auth.user._id === this.profile._id) {
        this.$auth.updateUser({
          background: {
            landscape: background.files?.landscape?.url,
            portrait: background.files?.portrait?.url
          }
        })
      }
      await this.$repos.profileRepo.settings.setAppBackground(
        this.profile._id,
        background._id
      )
      this.getProfile(this.profile._id)
    },
    async getBackgrounds (loading = true) {
      this.loading = loading
      this.backgroundId = this.profile.settings?.background?.id || null

      this.backgrounds = await this.$repos.profileRepo.appBackground.getAll()

      this.loading = false
    },
    async requestCustomBackgroundHandler () {
      const { data } = await this.$repos.profileRepo.getRefCWProfile()
      const chat = await this.$store.dispatch('chat/loadChat', data.chatId)

      this.$store.dispatch('chat/setCurrentChat', chat)
      this.$nextTick(() => {
        this.setCurrentDraft({
          text: this.$t('profile.entities.request_custom_background_message')
        })
      })
    }
  }
}
</script>

<style></style>
