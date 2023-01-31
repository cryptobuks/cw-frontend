<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${draftName || $t('entities.product')}`"
    :disabled="canPublish && draft.items.every(item => item.price)"
    :loading="publishing"
    v-on="!draft.isPublished ? { done: publish } : {}"
  >
    <base-form>
      <base-progressive-fields-container
        ref="fields"
        :fields="fields"
        :data="draft"
        :validated-data="originalProduct"
        :show-all-fields="!!draft._id"
        @can-save-change="canPublish = $event"
      >
        <template #name="{ inputAttrs }">
          <cw-input-product-name
            v-model="draft.name"
            v-bind="inputAttrs"
            :use-suggestions="!isTemplate && !draft._id"
            @existed="editExistedProduct"
            @blur="draftName = draft.name || null"
          />

          <cw-input-translations
            v-if="isTemplate"
            v-model="draft.nameTranslations"
            :hidden-languages="['en']"
            class="pl-8"
          />
        </template>

        <template #description="{ inputAttrs }">
          <cw-input-product-description
            v-model="draft.description"
            v-bind="inputAttrs"
          />

          <cw-input-translations
            v-if="isTemplate"
            v-model="draft.descriptionTranslations"
            :hidden-languages="['en']"
            textarea
            class="pl-8"
          />
        </template>

        <template #manufacturer="{ inputAttrs }">
          <cw-input-product-manufacturer
            v-model="draft.manufacturer"
            v-bind="inputAttrs"
          />
        </template>

        <template #categories="{ inputAttrs }">
          <base-select
            v-model="draft.categories"
            v-bind="inputAttrs"
            :items="categories.map(cat => cat.name)"
            select-on-blur
            hide-selected
            @new-item="draft.categories.push($event)"
          />
        </template>

        <template #details="{ inputAttrs }">
          <base-textarea
            v-model="draft.details"
            v-bind="inputAttrs"
            maxlength="1000"
          />

          <cw-input-translations
            v-if="isTemplate"
            v-model="draft.detailsTranslations"
            :hidden-languages="['en']"
            textarea
            class="pl-8"
          />
        </template>

        <template #items="{ inputAttrs }">
          <cw-input-product-items
            v-model="draft.items"
            v-bind="inputAttrs"
            :product="draft"
            :is-template="isTemplate"
          />
        </template>
      </base-progressive-fields-container>
    </base-form>

    <template v-if="!draft.isPublished" #actions>
      <base-button
        lg
        inline
        :disabled="!draftName"
        :loading="saving"
        class="mr-5 flex-shrink-0"
        @click="saveAsDraft"
      >
        <base-icon name="save" size="25" />
      </base-button>

      <base-button
        lg
        :disabled="!canPublish"
        :loading="publishing"
        class="flex-grow"
        @click="publish"
      >
        {{ $t("global.publish") }}
      </base-button>
    </template>
  </base-modal>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  props: {
    isTemplate: Boolean
  },
  data () {
    const fields = [
      { name: '_id', hidden: true },
      { name: 'isPublished', hidden: true, default: false },
      { name: 'nameTranslations', required: true, default: {}, hidden: true },
      { name: 'descriptionTranslations', default: {}, hidden: true },
      { name: 'detailsTranslations', default: {}, hidden: true },
      { name: 'name', required: true, default: '' },
      { name: 'description' },
      { name: 'manufacturer' },
      { name: 'categories', required: true, default: [] },
      { name: 'details' },
      { name: 'items', required: true, default: [] }
    ].map(f => Object.assign(f, {
      label: this.$t(`product.${f.name}.label`),
      tooltip: this.$t(`product.${f.name}.tooltip`),
      default: 'default' in f ? f.default : null
    }))

    return {
      fields,
      draft: this.$utils.extract(
        {},
        fields.map(f => ({ from: f.name, default: f.default }))
      ),
      draftName: null,
      originalProduct: null,

      canPublish: false,
      publishing: false,
      saving: false
    }
  },
  computed: {
    ...mapState('product', ['categories']),
    ...mapGetters('product', ['categoriesById', 'colorsById', 'sizesById'])
  },
  methods: {
    ...mapActions('product', ['mutateProduct', 'mutateProductTemplate']),

    show (product) {
      const draft = this.$utils.extract(product, this.fields.map(f => ({
        from: f.name,
        default: f.default
      })))

      draft.categories = product?.categoryIds
        ?.map(_id => this.categoriesById[_id]?.name)
        ?.filter(Boolean) || []

      draft.items = product?.items?.map?.(item => ({
        ...item,
        pictures: [...item.pictures],
        key: [this.colorsById[item.colorId].name, this.sizesById[item.sizeId].name].join('::'),
        color: this.colorsById[item.colorId],
        size: this.sizesById[item.sizeId]
      })) || []

      draft.pictures = {}

      draft.items.forEach?.(item => item?.pictures?.forEach?.((pic, i) => {
        if (!draft.pictures[pic.imageId]) {
          draft.pictures[pic.imageId] = {
            src: this.$utils.getFileUrl(pic.imageId, pic.filename),
            items: [item.key],
            filename: pic.filename
          }
        } else {
          draft.pictures[pic.imageId].items.push(item.key)
        }

        item.pictures[i] = pic.imageId
      }))

      if (this.isTemplate) {
        draft.nameTranslations = this.$utils.except(draft.name, 'en')
        draft.name = draft.name?.en || ''

        draft.descriptionTranslations = this.$utils.except(draft.name, 'en')
        draft.description = draft.description?.en || ''

        draft.detailsTranslations = this.$utils.except(draft.name, 'en')
        draft.details = draft.details?.en || ''
      }

      this.draft = draft

      this.draftName = this.draft.name

      this.originalProduct = this.$utils.clone(this.draft)

      this.$refs.modal.show()
    },

    editExistedProduct (product) {
      const overlappedData = this.$utils.extract(product, this.fields.map(f => f.name))

      Object.assign(this.draft, overlappedData)
      this.draftName = this.draft.name
      this.originalProduct = this.$utils.clone(overlappedData)

      this.$refs.fields.forceUpdate(null, {
        resetValidationFor: Object.keys(overlappedData)
      })
    },

    hide () {
      this.$refs.modal.hide()
    },

    async saveAsDraft () {
      this.draft.isPublished = false
      this.saving = true
      await this.save()
      this.saving = false
    },

    async publish () {
      this.draft.status = true
      this.publishing = true
      await this.save()
      this.publishing = false
    },

    async save () {
      const {
        pictures,
        categories,
        name,
        description,
        details,
        nameTranslations,
        descriptionTranslations,
        detailsTranslations,
        ...draft
      } = this.$utils.clone(this.draft)

      draft.categories = categories.map((name) => {
        const lowerName = name.toLowerCase()
        return this.categories.find(s => s.name.toLowerCase() === lowerName) || { name }
      })

      for (const item of draft.items) {
        item.pictures = []
      }

      const uploadPromises = []
      for (const [imageId, picture] of Object.entries(pictures)) {
        if (picture.isNew) {
          uploadPromises.push(
            this.$repos.productRepo.uploadImage({
              base64: picture.src,
              filename: picture.filename
            })
              .then(newPic => picture.items.forEach((itemKey) => {
                const item = draft.items.find(item => item.key === itemKey)
                item.pictures.push({
                  imageId: newPic._id,
                  filename: newPic.filename
                })
              }))
          )
        } else {
          picture.items.forEach((itemKey) => {
            const item = draft.items.find(item => item.key === itemKey)
            item.pictures.push({
              imageId,
              filename: picture.filename
            })
          })
        }
      }

      await Promise.all(uploadPromises)

      if (this.isTemplate) {
        await this.mutateProductTemplate({
          name: {
            ...nameTranslations,
            en: name
          },
          description: {
            ...descriptionTranslations,
            en: description
          },
          details: {
            ...detailsTranslations,
            en: details
          },
          ...draft
        })
      } else {
        await this.mutateProduct({
          name,
          description,
          details,
          ...draft
        })
      }

      this.$refs.modal.hide()
    }
  }
}
</script>
