<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${
      (entity && entity.translations && entity.translations.en) ||
      $t('nav.colors')
    }`"
    :loading="$nuxt.$loading.show"
    :disabled="!entity.name"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-input-text
        v-model="entity.name"
        :tooltip="$t('product.color_name_tooltip', { language })"
        :label="$t('product.color_name_label')"
        :placeholder="$t('product.color_name_placeholder')"
        :rules="[rules.required, rules.unique(listOfSportInterests.en)]"
      >
        <template v-if="entity.isTranslated" #prepend-icon>
          <img src="/images/flag/en.svg">
        </template>
      </base-input-text>

      <base-switcher
        v-model="entity.isTranslated"
        class="border border-black border-opacity-25 rounded-full self-end"
        true-text="TRANSLATION ON"
        false-text="TRANSLATION OFF"
        false-color="black"
      />

      <h1 v-if="entity.isTranslated" class="cw-translation-title">
        {{ $t("global.translation") }}
      </h1>

      <cw-input-translations
        v-if="entity.isTranslated"
        v-model="entity.translations"
        :hidden-languages="['en']"
        :unique-translations="listOfSportInterests"
        class="cw-sports-interest-update"
      />
    </base-form>
  </base-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data () {
    return {
      entityName: null,
      entity: {
        name: null,
        parentId: null,
        translations: {}
      },
      isParent: false,
      translationStatus: true,
      showTranslation: true,
      language: 'English'
    }
  },
  computed: {
    ...mapGetters({
      colors: 'product/colors',
      languages: 'settings/languages'
    }),
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    },
    listOfSportInterests () {
      const obj = { en: [] }
      this.colors.forEach((color) => {
        if (!this.entity._id || this.entity._id !== color._id) {
          for (const key of Object.keys(color.translations)) {
            if (obj[key] === undefined) {
              obj[key] = []
            }

            if (color.translations[key]) {
              obj[key].push(color.translations[key].toLowerCase())
            }
          }
        }
      })
      return obj
    }
  },
  methods: {
    ...mapActions({
      saveColor: 'product/saveColor'
    }),
    show (entity, isParent = false) {
      this.entity = this.$utils.extract(entity, {
        _id: undefined,
        name: null,
        isTranslated: null,
        parentId: null,
        translations: {}
      })
      this.entityName = this.entity.name
      this.entity.translations.en = this.entity.name
      this.isParent = isParent

      this.$refs.modal.show()
    },
    save () {
      this.entity.translations.en = this.entity.name
      this.entity.translations = this.entity.isTranslated
        ? this.entity.translations
        : {}
      this.saveColor(this.entity).then((response) => {
        if (response.success) {
          this.$refs.modal.hide()
          this.entityName = null
          this.entity = {
            name: null,
            parentId: null,
            translations: {}
          }
          this.$notifier.success(response.message)
        }
      })
    },
    onInput (value) {
      if (value) {
        this.showTranslation = true
      } else {
        this.showTranslation = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.cw-translation-title {
  color: #fff;
  font-size: 20px;
  margin: 30px 0 20px;
}

.cw-sports-interest-update {
  margin-left: 30px;
}
</style>
