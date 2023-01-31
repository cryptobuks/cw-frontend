<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: `flex flex-col h-full ${!loading ? 'bg-white p-4' : ''}`,
      title: $t('global.languages'),
      showSearchToggler: true,
      hideSearch: false,
    }"
    v-on="$listeners"
    @search="keywords = $event"
  >
    <base-card-loading v-if="loading" />
    <div v-else class="h-full bg-white flex flex-col space-y-3">
      <div
        v-for="lang in filteredLanguages"
        :key="lang._id"
        class="border rounded-lg h-16 w-full p-4 flex items-center justify-between"
      >
        <div class="flex items-center">
          <img
            :src="`/images/flag/${lang.language}.svg`"
            class="w-6 h-6 rounded-full object-cover mr-3"
          >

          <span class="font-extrabold text-sm capitalize ml-1">{{
            $t(lang.label)
          }}</span>
        </div>

        <base-input-radio
          v-model="language"
          :value="lang.language"
          @change="submit"
        />
      </div>
    </div>
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  props: { profile: { type: Object, required: true } },
  data: () => ({ keywords: '', language: null, loading: true }),
  computed: {
    ...mapGetters('settings', ['languages']),
    filteredLanguages () {
      return [...this.languages]
        .sort((a, b) => (a.label > b.label ? 1 : -1))
        .filter(language =>
          language.label.toLowerCase().match(this.keywords.toLowerCase())
        )
    }
  },
  async created () {
    this.language = this.profile.settings?.language || null
    await this.getLanguages()
    this.loading = false
  },
  methods: {
    ...mapActions('settings', ['getLanguages']),
    ...mapActions('profile', ['getProfile']),
    async submit () {
      await this.$repos.profileRepo.settings.setLanguage(this.language)
      this.$i18n.setLocale(this.language)
      this.$notifier.success(this.$t('global.success'))
      this.getProfile(this.profile._id)
    }
  }
}
</script>
