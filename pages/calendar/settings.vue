<template>
  <base-main-card v-bind="{ title: $t('global.settings'), hideSearch: true }">
    <cw-calendar-settings-modal
      ref="modal"
      v-bind="{ businessSettings }"
      @done="getSettings(false)"
    />
    <base-card-loading v-if="loading" v-bind="{ roundness: '' }" />
    <div v-else class="mx-4">
      <base-masonry-list
        v-slot="{ item: setting }"
        class="p-4 text-white max-w-full"
        v-bind="{
          itemClass: 'mb-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 px-1',
          items: [...settings, ...defaultSettings]
        }"
      >
        <div
          class="rounded-lg shadow-cw-card p-4 cursor-pointer"
          :class="[setting.isDefault ? 'bg-cw-red' : 'bg-gray-600']"
          @click="$refs.modal.show(setting)"
        >
          <h4 class="font-extrabold capitalize">
            {{ setting.title }}
          </h4>
          <p
            v-for="(paragraph, pIndex) in settingContents[setting.option]"
            :key="pIndex"
            class="text-xs my-2"
            v-html="$t(paragraph, setting)"
          />
        </div>
      </base-masonry-list>
    </div>
  </base-main-card>
</template>

<script>
export default {
  data: () => ({
    businessSettings: {},
    defaultSettings: [],
    loading: true,
    settings: []
  }),
  computed: {
    settingContents () {
      return {
        bookingRules: [
          'calendar.settings.bookingRules.content.booking',
          'calendar.settings.bookingRules.content.violation'
        ],
        calendarVisibility: ['calendar.settings.calendarVisibility.content'],
        trackPresence: [
          'calendar.settings.trackPresence.content.user',
          'calendar.settings.trackPresence.content.trainer',
          'calendar.settings.trackPresence.content.operator_director'
        ],
        trainerSubstitution: ['calendar.settings.trainerSubstitution.content']
      }
    }
  },
  created () {
    this.getSettings()
  },
  methods: {
    async getSettings (loading = true) {
      this.loading = loading
      const requests = [this.$repos.settingsRepo.calendar.get()]
      if (this.$auth.isCW(this.$auth.user.typeCode)) {
        requests.push(this.$repos.settingsRepo.calendar.getDefault())
      }

      const [data, defaultData] = await Promise.all(requests)
      this.businessSettings = data.settings
      this.settings = this.transformSettings(data)
      if (defaultData) { this.defaultSettings = this.transformSettings(defaultData) }
      this.loading = false
    },
    transformSettings (data) {
      return Object.keys(data.settings.options).map(option => ({
        ...data.settings.options[option],
        isDefault: data.settings.isDefault,
        option,
        title: `${this.$t(`calendar.settings.${option}`)} ${
          data.settings.isDefault ? this.$t('global.default') : ''
        }`
      }))
    }
  }
}
</script>
