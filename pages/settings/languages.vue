<template>
  <base-main-card
    :title="$t('global.languages')"
    :actions="[
      { icon: 'import', tooltip: $t('languages.import_tooltip'), handler: () => importTranslations() },
      { icon: 'export', tooltip: $t('languages.export_tooltip'), handler: () => openExportTranslationsModal() }
    ]"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredTranslations" item-height="150px">
      <template #item="{ item: translation }">
        <base-swipe-card
          hide-remove
          :title="translation.translations.en"
          @edit="showEditTranslation(translation)"
        >
          <div v-auto-resize-text="{ tooltipOnly: true }" class="text-gray-500">
            {{ translation.key }}
          </div>
          <template #footer>
            <cw-translations-status :translations="translation.translations" />

            <span>
              {{ getFormattedDate(translation.updatedAt) }}
            </span>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-translation-maker ref="translationMaker" />

    <cw-translations-exporter ref="translationExporter" />
  </base-main-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  meta: {
    permission: 'settings.languagess'
  },
  data () {
    return {
      keywords: null,
      isSearchOpened: false,
      importedCsvFile: ''
    }
  },
  computed: {
    ...mapGetters({
      translations: 'settings/translations',
      languages: 'settings/languages'
    }),
    filteredTranslations () {
      if (this.keywords) {
        const keywords = this.keywords.toLowerCase()
        const filtered = this.translations.filter((trans) => {
          const translationValues = Object.values(trans.translations)
          return trans.key.toLowerCase().includes(keywords) ||
            translationValues.some(translated => translated && translated.toLowerCase().includes(keywords))
        })

        return this.$utils.sortBy(filtered, 'translations.en')
      }
      return this.$utils.sortBy(this.translations.slice(), 'translations.en')
    }
  },
  mounted () {
    this.getLanguages()
    this.getTranslations()
  },
  methods: {
    ...mapActions({
      getTranslations: 'settings/getTranslations',
      getLanguages: 'settings/getLanguages'
    }),

    getFormattedDate (date) {
      return this.$dayjs(date).format('D.M.YYYY')
    },

    showEditTranslation (translation) {
      this.$refs.translationMaker.show(translation)
    },
    toggleSearch () {
      this.isSearchOpened = !this.isSearchOpened
    },
    async importTranslations (data) {
      const fileContent = await this.$inputFile({ accept: '.csv', base64: true })
      if (fileContent) {
        return this.$repos.settingsRepo.translation.import({ content: fileContent.split(',').pop() })
          .then(res => res && res.success && this.$notifier.success(res.message))
      }
    },
    openExportTranslationsModal () {
      this.$refs.translationExporter.show()
    }
  }
}
</script>
