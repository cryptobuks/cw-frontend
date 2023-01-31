<template>
  <div>
    <cw-input-subflow-wrapper
      v-bind="$attrs"
      :items="value"
      :affix="`${value.length} / ${value.length}`"
      @add-item="$refs.itemsModal.show()"
    >
      <cw-product-items-modal
        ref="itemsModal"
        :product="product"
        :is-template="isTemplate"
        @done="updateProductItems"
      />

      <template #item="{ item }">
        <base-swipe-card
          auto-height
          bg-color="#404040"
          body-class="flex pr-4"
          hide-edit
          @remove="$emit('input', value.filter(v => v.key !== item.key))"
        >
          <div
            v-if="item.pictures && item.pictures.length && product.pictures[item.pictures[0]]"
            class="w-14 h-14 flex-shrink-0 mr-3 bg-gray-600 flex"
          >
            <img :src="product.pictures[item.pictures[0]].src" class="w-full h-full object-cover">
          </div>

          <div class="flex-grow">
            <h4>
              {{ product.name }} {{ item.color.name }} {{ item.size.name }}
            </h4>

            <div v-if="item.barCode" class="text-gray-400 text-xs mt-2">
              {{ item.barCode }}
            </div>
          </div>

          <div v-if="item.price || item.quantity" class="ml-3">
            <div class="mb-2">
              {{ item.price }}{{ currencySymbol }}
            </div>

            <div v-if="!isTemplate" class="text-xs">
              {{ item.quantity || 0 }} pcs
            </div>
          </div>
        </base-swipe-card>
      </template>
    </cw-input-subflow-wrapper>

    <template v-if="value.length">
      <!-- Add Prices -->
      <cw-input-subflow-wrapper
        v-if="!isTemplate"
        :label="$t('product_items.prices.label')"
        :tooltip="$t('product_items.prices.tooltip')"
        :affix="`${ value.filter(item => item.price).length } / ${ value.length }`"
        @add-item="$refs.priceModal.show()"
      >
        <cw-product-item-prices-modal
          ref="priceModal"
          :currency-symbok="currencySymbol"
          :product="product"
          @done="updateProductItems"
        />
      </cw-input-subflow-wrapper>

      <!-- Add Barcode -->
      <cw-input-subflow-wrapper
        :label="$t('product_items.barcodes.label')"
        :tooltip="$t('product_items.barcodes.tooltip')"
        :affix="`${ value.filter(item => item.barCode).length } / ${ value.length }`"
        @add-item="$refs.barcodeModal.show()"
      >
        <cw-product-item-barcode-modal
          ref="barcodeModal"
          :product="product"
          @done="updateProductItems"
        />
      </cw-input-subflow-wrapper>

      <!-- Add Quantities -->
      <cw-input-subflow-wrapper
        v-if="!isTemplate"
        :label="$t('product_items.quantities.label')"
        :tooltip="$t('product_items.quantities.tooltip')"
        :affix="`${ value.filter(item => item.quantity).length } / ${ value.length }`"
        @add-item="$refs.quantityModal.show()"
      >
        <cw-product-item-quantity-modal
          ref="quantityModal"
          :product="product"
          @done="updateProductItems"
        />
      </cw-input-subflow-wrapper>

      <!-- Add Pictures -->
      <cw-input-subflow-wrapper
        :label="$t('product_items.pictures.label')"
        :tooltip="$t('product_items.pictures.tooltip')"
        :affix="`${ value.filter(item => item.pictures && item.pictures.length).length } / ${ value.length }`"
        @add-item="$refs.pictureModal.show()"
      >
        <cw-product-item-picture-modal
          ref="pictureModal"
          :product="product"
          @done="onPictureModalDone"
        />
      </cw-input-subflow-wrapper>
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Array, required: true },
    product: { type: Object, required: true },
    isTemplate: Boolean
  },
  computed: {
    currencySymbol () {
      const country = this.$auth.countryCode &&
        this.$store.state.country.managedCountries.find(c => c.code === this.$auth.countryCode)
      return country?.currency?.symbol || '$'
    }
  },
  methods: {
    updateProductItems (productItems) {
      this.$emit('input', productItems.map(prod => ({
        ...this.value.find(p => p.key === prod.key),
        ...prod
      })))

      this.$attrs.listeners?.validated?.()
    },

    onPictureModalDone ({ pictures, productItems }) {
      Object.assign(this.product, { pictures })
      this.updateProductItems(productItems)
    },

    remove (product) {
      this.$confirm(this.$t('input.product_item.confirm_remove', {
        name: [this.product.name, product.color, product.size].filter(Boolean).join(' ')
      }), () => {
        this.value.splice(this.value.indexOf(product), 1)
      })
    }
  }
}
</script>
