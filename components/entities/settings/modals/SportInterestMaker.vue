<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${
      entityName || $t('entities.sport_interest')
    }`"
    :loading="$nuxt.$loading.show"
    :disabled="!entity.translations.en"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-input-text
        v-model="entity.translations.en"
        :tooltip="$t('sport.lang_en_tooltip')"
        :label="$t('sport.lang_en_label')"
        :rules="[rules.required, rules.unique(listOfSportInterests.en)]"
      >
        <template #prepend-icon>
          <img src="/images/flag/en.svg">
        </template>
      </base-input-text>

      <base-select
        v-if="!isParent"
        v-model="entity.parentId"
        :value="entity.parentId"
        :tooltip="$t('sport.cat_tooltip')"
        :label="$t('sport.cat_label')"
        :items="sportInterests.filter((s) => !s.parentId && s._id !== entity._id)"
        item-text="name"
        item-value="_id"
        hide-selected
        searchable
        sort-by-text
      >
        <template #prepend-icon>
          <img src="/images/flag/en.svg">
        </template>

        <template #empty>
          Not option left
        </template>

        <template #not-found>
          No result found
        </template>
      </base-select>

      <h1 class="cw-translation-title">
        {{ $t("global.translation") }}
      </h1>

      <cw-input-translations
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
      isParent: false
    }
  },
  computed: {
    ...mapGetters({
      sportInterests: 'settings/sportInterests',
      languages: 'settings/languages'
    }),
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    },
    listOfSportInterests () {
      const obj = { en: [] }
      this.sportInterests.forEach((sport) => {
        if (!this.entity._id || this.entity._id !== sport._id) {
          for (const key of Object.keys(sport.translations)) {
            if (obj[key] === undefined) {
              obj[key] = []
            }

            if (sport.translations[key]) {
              obj[key].push(sport.translations[key].toLowerCase())
            }
          }
        }
      })
      return obj
    }
  },
  methods: {
    ...mapActions({
      saveSportInterest: 'settings/saveSportInterest'
    }),
    show (entity, isParent = false) {
      this.entity = this.$utils.extract(entity, {
        _id: undefined,
        name: null,
        parentId: null,
        translations: {}
      })
      this.entityName = this.entity.name
      this.isParent = isParent

      this.$refs.modal.show()
    },
    save () {
      this.entity.name = this.entity.translations.en

      this.saveSportInterest(this.entity).then((response) => {
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
