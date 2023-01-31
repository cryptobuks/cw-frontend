<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${entityName || $t('entities.translation')}`"
    :loading="$nuxt.$loading.show"
    :disabled="!entity.translations.en || !entity.key"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-input-text
        v-model="entity.translations.en"
        :tooltip="$t('translation.lang_en_tooltip')"
        :label="$t('translation.lang_en_label')"
        :rules="[
          rules.required, rules.maxLength(200),
          listOfTranslations.en && rules.unique(listOfTranslations.en)
        ]"
        :maxlength="200"
      >
        <template #prepend-icon>
          <img src="/images/flag/en.svg">
        </template>
      </base-input-text>

      <base-input-text
        v-model="entity.key"
        :tooltip="$t('translation.key_identifier_tooltip')"
        :label="$t('translation.key_identifier_label')"
        readonly
        :rules="[rules.required, rules.maxLength(100)]"
        :maxlength="100"
      />

      <h1 class="cw-translation-title">
        {{ $t('global.translation') }}
      </h1>

      <cw-input-translations
        v-model="entity.translations"
        :hidden-languages="['en']"
        :unique-translations="listOfTranslations"
        :maxlength="200"
        class="pl-8"
      />
    </base-form>
  </base-modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'EditTranslationModal',
  data () {
    return {
      entityName: null,
      entity: {
        _id: null,
        key: null,
        translations: {}
      }
    }
  },
  computed: {
    ...mapGetters({
      allTranslations: 'settings/translations',
      languages: 'settings/languages'
    }),

    isMobileView () {
      return ['mobile'].includes(this.$mq)
    },
    listOfTranslations () {
      const entityKey = this.entity.key
      const shouldBeUnique = entityKey && ['_sportinterest.', '_terms-of-payment.'].some(k => entityKey.startsWith(k))
      if (!shouldBeUnique) {
        return {}
      }

      const obj = {}
      this.allTranslations.forEach((trans) => {
        if (trans._id !== this.entity._id) {
          for (const key of Object.keys(trans.translations)) {
            if (obj[key] === undefined) {
              obj[key] = []
            }
            trans.translations[key] && obj[key].push(trans.translations[key].toLowerCase())
          }
        }
      })
      return obj
    }
  },
  methods: {
    ...mapActions({
      updateTranslation: 'settings/updateTranslation'
    }),
    show (translation) {
      this.entity = this.$utils.extract(translation, ['_id', 'key', 'translations'])

      this.entityName = null
      if (translation && translation.translations && translation.translations.en) {
        this.entityName = translation.translations.en
      }

      this.$refs.modal.show()
    },
    save () {
      const data = {
        ...this.entity,
        updatedAt: new Date().toISOString()
      }

      this.updateTranslation(data).then((response) => {
        if (response.success) {
          this.$refs.modal.hide()
          this.$notifier.success(response.message)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.cw-translation-title {
  color: #fff;
  font-size: 20px;
  margin: 30px 0 20px;
}
</style>
