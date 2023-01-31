<template>
  <base-modal
    ref="modal"
    :title="$t('translation.export_modal_title')"
    :loading="$nuxt.$loading.show"
    :disabled="!language"
    @done="exportToCSV(language)"
  >
    <base-select
      v-model="language"
      :label="$t('global.languages')"
      :items="languages"
      item-text="language"
      item-value="language"
    />
  </base-modal>
</template>

<script>
import { saveAs } from 'file-saver'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      language: null
    }
  },
  computed: {
    ...mapGetters({
      languages: 'settings/languages'
    })
  },
  methods: {
    show () {
      this.$refs.modal.show()
    },
    exportToCSV (language = 'en') {
      if (language) {
        this.$repos.settingsRepo.translation.export(language)
          .then((response) => {
            const content = new Blob([response.data.content], { type: 'text/csv;charset=utf-8;' })
            const filename = language.toUpperCase() + '_Translations.csv'
            saveAs(content, filename)
            this.$refs.modal.hide()
            this.$notifier.success('Exported!')
          })
      }
    }
  }
}
</script>
