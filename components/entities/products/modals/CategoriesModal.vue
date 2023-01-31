<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${
      (entity && entity.name) || $t('nav.categories')
    }`"
    :loading="saving"
    :disabled="!entity.name"
    @done="save"
  >
    <base-form v-slot="{ rules }">
      <base-input-text
        v-model="entity.name"
        :tooltip="$t('product.category_name_tooltip')"
        :label="$t('product.category_name')"
        :placeholder="$t('product.category_name_placeholder')"
        :rules="[rules.required, rules.unique(listOfCategories.en || [])]"
      >
        <template #prepend-icon>
          <img src="/images/flag/en.svg">
        </template>
      </base-input-text>

      <base-select
        v-model="entity.parentId"
        :tooltip="$t('product.group_category_tooltip')"
        :label="$t('product.group_category_label')"
        :placeholder="$t('product.group_category_placeholder')"
        :items="categories.filter((s) => !s.parentId)"
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

      <base-select
        v-model="selectedColors"
        :value="selectedColors"
        :tooltip="$t('product.color_or_taste')"
        :label="$t('product.color_or_taste')"
        :placeholder="$t('product.color_or_taste_placeholder')"
        :items="colors"
        item-text="name"
        class="placeholder"
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

      <base-select
        v-model="selectedSizes"
        :value="selectedSizes"
        :tooltip="$t('product.sizes')"
        :label="$t('product.sizes')"
        :placeholder="$t('product.sizes_placeholder')"
        class="placeholder"
        :items="sizes"
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
        :unique-translations="listOfCategories"
        class="cw-sports-interest-update"
      />

      <div v-if="type === 'manage'" class="flex">
        <base-switcher
          v-model="isPublic"
          class="border border-black border-opacity-25 rounded-full self-end mr-2"
          false-text="PRIVATE"
          true-text="PUBLIC"
          false-color="black"
        />
        <h1>{{ profile && profile.displayName }}</h1>
      </div>
    </base-form>
    <template v-if="type === 'manage'" #actions>
      <base-button
        lg
        inline
        :loading="saving"
        class="mr-5 flex-shrink-0"
        @click="saveAsDraft"
      >
        <base-icon name="dismiss" size="25" />
      </base-button>

      <base-button
        lg
        :loading="saving"
        :disabled="!entity.name"
        class="flex-grow"
        @click="save"
      >
        <base-icon name="save" size="25" />
      </base-button>
    </template>
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
        parentId: '',
        colors: [],
        sizes: []
      },
      type: null,
      isParent: false,
      isPublic: false,
      selectedSizes: [],
      selectedColors: [],
      saving: false
    }
  },
  computed: {
    ...mapGetters({
      categories: 'product/categories',
      languages: 'settings/languages',
      colors: 'product/colors',
      sizes: 'product/sizes'
    }),
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    },
    listOfCategories () {
      const obj = { en: [] }
      this.categories.forEach((sport) => {
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
    },
    profile () {
      if (!this.entity?.onlyForGymId) {
        return null
      }
      return this.$store.getters['chat/getFriend'](this.entity?.onlyForGymId)
    }
  },
  methods: {
    ...mapActions({
      saveCategory: 'product/saveCategory'
    }),
    show (entity, payload) {
      this.type = payload
      this.entity = this.$utils.extract(entity, {
        _id: undefined,
        name: null,
        onlyForGymId: null,
        translations: {}
      })
      this.entity.translations.en = this.entity.name
      if (entity?.parentId) {
        this.entity.parentId = entity?.parentId
      }
      this.entityName = this.entity.name
      this.selectedColors =
        entity?.colors?.map((item) => {
          return item._id
        }) || []
      this.selectedSizes =
        entity?.sizes?.map((item) => {
          return item._id
        }) || []

      this.$refs.modal.show()
    },
    save () {
      this.entity.colors = this.selectedColors
      this.entity.translations.en = this.entity.name
      this.entity.sizes = this.selectedSizes
      this.entity.onlyForGymId =
        this.type === 'manage' && this.isPublic
          ? null
          : this.entity.onlyForGymId

      this.saveCategory(this.entity).then((response) => {
        if (response.success) {
          this.$refs.modal.hide()
          this.entityName = null
          this.entity = {
            name: null,
            translations: {}
          }
          this.isPublic = false
          this.selectedSizes = []
          this.selectedColors = []
          this.$notifier.success(response.message)
        }
      })
    },
    saveAsDraft () {
      this.entity.colors = this.selectedColors
      this.entity.sizes = this.selectedSizes

      this.saveCategory({ ...this.entity, isHiddenForCw: true }).then(
        (response) => {
          if (response.success) {
            this.$refs.modal.hide()
            this.entityName = null
            this.entity = {
              name: null,
              translations: {}
            }
            this.selectedSizes = []
            this.selectedColors = []
            this.$notifier.success(response.message)
          }
        }
      )
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
