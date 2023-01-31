<template>
  <base-modal
    ref="modal"
    :title="$t('system_messages.export_modal_title')"
    :loading="$nuxt.$loading.show"
    :disabled="!language"
    @done="exportToCSV(language)"
  >
    <base-select
      v-model="language"
      :label="$t('system_messages.export_languages_label')"
      :items="languages"
      item-text="language"
      item-value="language"
    />
  </base-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { saveAs } from 'file-saver'
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
        this.$store.dispatch('system-message/downloadMessages', language)
          .then((response) => {
            const file = new Blob([response.data.content], { type: 'text/csv;charset=utf-8;' })
            const filename = language.toUpperCase() + '_System_messages.csv'
            saveAs(file, filename)
            this.$refs.modal.hide()
            this.$notifier.success('Exported!')
          })
      }
    }
  }
}
</script>
