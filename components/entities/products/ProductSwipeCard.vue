<template>
  <base-swipe-card
    :actions="actions"
    :hide-actions="expanded"
    :bg-color="isTemplate ? '#a02f29' : '#404040'"
    auto-height
    container-class="product-swipe-card__container"
    toggler-class="-mr-3 -mt-2"
    body-class="flex text-sm"
    class="product-swipe-card"
  >
    <div v-show="!expanded" class="rounded-l-xl bg-yellow-500 w-4 flex-shrink-0" />

    <div class="flex-grow overflow-hidden flex flex-col">
      <div class="flex px-3 pt-3 flex-grow">
        <div v-if="!expanded" class="w-14 flex-shrink-0 mr-3">
          <div
            class="mb-1 w-14 h-14 bg-gray-600 flex relative select-none rounded"
            :class="{ 'cursor-pointer': selectedProductItem.pictures.length > 0 }"
            @click="$emit('view-pictures', selectedProductItem)"
          >
            <template v-if="selectedProductItem.pictures.length > 1">
              <div
                class="w-1/3 -ml-2 flex items-center justify-start absolute left-0 top-0 h-full z-1 cursor-pointer"
                @click.stop="incImgIndex(-1)"
              >
                <base-icon name="chevron-left" class="text-white" />
              </div>

              <div
                class="w-1/3 -mr-2 flex items-center justify-end absolute right-0 top-0 h-full z-1 cursor-pointer"
                @click.stop="incImgIndex(1)"
              >
                <base-icon name="chevron-right" class="text-white" />
              </div>
            </template>

            <template v-if="selectedProductItem.pictures.length">
              <img
                :key="activeImgSrc"
                :src="activeImgSrc"
                class="w-full h-full object-cover rounded"
              >
            </template>
          </div>

          <div class="text-center text-xs">
            <template v-if="isTemplate">
              {{ product.items.length }} refs
            </template>

            <template v-else>
              {{ selectedProductItem.quantity || 0 }} pcs
            </template>
          </div>
        </div>

        <div class="overflow-hidden flex-grow" :class="{ 'pr-3': !expanded }">
          <div class="mb-2 flex">
            <h4 class="mr-2 font-semibold">
              {{ getTranslatedText(product.name) }}
            </h4>

            <base-icon
              :name="expanded ? 'chevron-up' : 'chevron-down'"
              class="ml-auto cursor-pointer flex-shrink-0 select-none text-xs"
              @click="toggleProductDetail"
            />
          </div>

          <template v-if="!expanded">
            <p
              v-if="product.description"
              class="line-clamp-2 text-xs whitespace-pre-wrap mb-2 overflow-hidden"
              v-html="getTranslatedText(product.description)"
            />

            <div v-if="!expanded" class="flex -mx-1 mb-2 text-xs">
              <base-menu
                :active-index="sizeIds.indexOf(selectedSizeId)"
                :items="sizeIds"
                light
                class="flex items-center bg-white rounded-sm px-1 overflow-hidden mx-1 text-black cursor-pointer"
                @item-click="selectedSizeId = $event"
              >
                <template #activator>
                  <span class="truncate mr-1">{{ getSizeName(selectedSizeId) }}</span>

                  <base-icon name="chevron-down" class="ml-auto text-xs flex-shrink-0" />
                </template>

                <template #item-text="{ item: sizeId }">
                  {{ getSizeName(sizeId) }}
                </template>
              </base-menu>

              <base-menu
                :active-index="colorIds.indexOf(selectedColorId)"
                :items="colorIds"
                light
                class="flex items-center bg-white rounded-sm px-1 overflow-hidden mx-1 text-black cursor-pointer"
                @item-click="selectedColorId = $event"
              >
                <template #activator>
                  <span class="truncate mr-1">{{ getColorName(selectedColorId) }}</span>

                  <base-icon name="chevron-down" class="ml-auto text-xs flex-shrink-0" />
                </template>

                <template #item-text="{ item: colorId }">
                  {{ getColorName(colorId) }}
                </template>
              </base-menu>
            </div>
          </template>

          <template v-else>
            <p
              class="text-xs whitespace-pre-wrap mb-3 opacity-75"
              v-html="[getTranslatedText(product.description), product.items[0].target && product.items[0].target.toUpperCase()].filter(Boolean).join(' | ')"
            />

            <base-scroll class="max-h-53">
              <base-checkbox
                v-for="item in product.items"
                :key="item._id"
                v-model="selectedIds"
                :value="item._id"
                :disabled="!item.quantity || !item.isActive"
                :diasbled-label="!item.quantity || !item.isActive"
                class="mb-2 h-9 text-xs"
                sm
              >
                <template v-if="!isTemplate && !item.quantity || !item.isActive" #input>
                  <div
                    class="text-lg rounded-full block text-white w-4 h-4 flex-shrink-0 flex items-center justify-center mr-3"
                    :class="[item.isActive ? 'bg-gray-400' : 'bg-red']"
                  >
                    X
                  </div>
                </template>

                <template #default>
                  <div :class="[!item.isActive ? 'text-gray-400' : !item.quantity ? 'text-red': '']" class="flex">
                    <div class="flex-grow">
                      <div>
                        {{ getColorName(item.colorId) }} {{ getSizeName(item.sizeId) }}
                        <template v-if="!isTemplate">
                          | {{ item.quantity || 0 }}pcs | {{ item.price }}{{ currencySymbol }}
                        </template>
                      </div>

                      <div v-if="item.barCode" class="opacity-75">
                        {{ item.barCode }}
                      </div>
                    </div>

                    <template v-if="!isTemplate">
                      <base-icon
                        v-if="!item.isActive"
                        v-tippy="$t('product_item.reactivate')"
                        name="play"
                        class="ml-2 cursor-pointer flex-shrink-0"
                        @click="reactivate(item)"
                      />

                      <base-icon
                        v-else-if="!item.quantity"
                        name="add"
                        class="ml-2 cursor-pointer flex-shrink-0"
                        @click="refill(item)"
                      />
                    </template>
                  </div>
                </template>
              </base-checkbox>
            </base-scroll>

            <p
              v-if="product.details"
              class="text-xs whitespace-pre-wrap mt-2 opacity-75"
              v-html="getTranslatedText(product.details)"
            />

            <div v-if="product.manufacturer" class="mt-2 opacity-75 text-xs">
              {{ product.manufacturer }}
            </div>
          </template>
        </div>
      </div>

      <div v-if="!isTemplate" class="text-right text-xs px-3 mb-1">
        <template v-if="expanded">
          {{ $t('product_item.total_selected') }}
        </template>
        {{
          expanded
            ? selectedProductItems.reduce((s, c) => s + (c.price || 0), 0)
            : selectedProductItem.price
        }}{{ currencySymbol }}
      </div>

      <cw-translations-status v-if="isTemplate" :translations="validTranslations" class="m-1 px-2" />

      <footer v-else class="flex items-center border-t border-gray-600 h-10">
        <div class="border-r border-gray-600 flex justify-center items-center w-1/3 text-lg cursor-pointer h-full">
          <base-icon name="share" />
        </div>

        <div class="flex-grow flex justify-center pl-3 pr-1">
          <base-input-quantity v-model="quantity" input-class="text-sm" />
        </div>

        <div class="pr-3 pl-2 cursor-pointer flex justify-center items-center text-lg w-13">
          <base-icon name="shopping" />
        </div>
      </footer>
    </div>
  </base-swipe-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    product: { type: Object, required: true },
    isTemplate: Boolean
  },
  data () {
    return {
      selectedSizeId: this.product.items[0]?.sizeId,
      selectedColorId: this.product.items[0]?.colorId,
      imgIndex: 0,

      quantity: 0,

      expanded: false,

      selectedIds: []
    }
  },
  computed: {
    ...mapGetters('product', ['colorsById', 'sizesById']),

    actions () {
      const actions = [
        { icon: 'bin', danger: true, color: '#fff', handler: () => this.$emit('remove') },
        { icon: 'pen', handler: () => this.$emit('edit') }
      ]
      if (!this.isTemplate) {
        actions.splice(1, 0, { icon: 'add', bgColor: '#3472a6', color: '#fff', handler: () => this.$emit('add-quantity') })
      }
      return actions
    },

    selectedProductItem () {
      const item = this.product.items.find(p => p.sizeId === this.selectedSizeId && p.colorId === this.selectedColorId)
      return item || { pictures: [], quantity: 0, price: 0 }
    },

    selectedProductItems () {
      return this.selectedIds.map(id => this.product.items.find(item => item._id === id))
    },

    sizeIds () {
      return Array.from(new Set(this.product.items.map(item => item.sizeId)))
    },

    colorIds () {
      return Array.from(new Set(this.product.items.map(item => item.colorId)))
    },

    currencySymbol () {
      const country = this.$auth.countryCode &&
        this.$store.state.country.managedCountries.find(c => c.code === this.$auth.countryCode)
      return country?.currency?.symbol || '$'
    },

    activeImgSrc () {
      const { imageId, filename } = this.selectedProductItem.pictures[this.imgIndex] || {}
      return this.$utils.getFileUrl(imageId, filename)
    },

    validTranslations () {
      if (!this.isTemplate) {
        return null
      }

      const translations = {}
      const { name, description, details } = this.product
      for (const { language } of this.$store.state.settings.languages) {
        if (name?.[language] && description?.[language] && details?.[language]) {
          translations[language] = name[language]
        }
      }
      return translations
    }
  },
  watch: {
    selectedProductItem () {
      this.imgIndex = 0
      this.quantity = 0
    }
  },
  methods: {
    incImgIndex (inc) {
      const len = this.selectedProductItem.pictures.length
      this.imgIndex = Math.min(len - 1, (len + this.imgIndex + inc) % len)
    },

    getSizeName (sizeId) {
      return this.sizesById[sizeId]?.name
    },

    getColorName (colorId) {
      return this.colorsById[colorId]?.name
    },

    toggleProductDetail () {
      this.selectedIds = this.product
        .items.filter(item => item.isActive && item.quantity > 0)
        .map(item => item._id)
      this.expanded = !this.expanded
    },

    getTranslatedText (trans) {
      if (!trans) {
        return ''
      }
      return this.isTemplate ? trans[this.$i18n.locale] || trans.en || trans.it || trans.es : trans
    },

    reactivate (productItem) {},

    refill (productItem) {}
  }
}
</script>

<style lang="scss">
.product-swipe-card {
  &__container {
    padding: 0 !important;
  }
}
</style>
