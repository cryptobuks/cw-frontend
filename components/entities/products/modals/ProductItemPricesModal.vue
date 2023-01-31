<template>
  <cw-product-item-metadata-modal-wrapper
    ref="modal"
    v-slot="{ rules, replicate, itemMetadata }"
    v-bind="$attrs"
    :metadata-type="$t('product_item.prices')"
    :fields="[
      { name: 'price', required: true, default: null },
      { name: 'publicPrice', default: true }
    ]"
    v-on="$listeners"
  >
    <base-input-text
      v-model="itemMetadata.price"
      :label="$t('product_item.price.label')"
      :tooltip="$t('product_item.price.tooltip')"
      :rules="[rules.required]"
      type="number"
      min="0"
      max="99999"
      :affix="itemMetadata.price ? currencySymbol : ''"
      class="ml-auto mr-6 md:mr-12 flex-shrink-0"
      input-class="text-right"
      style="margin-bottom: 0; max-width: 200px;"
      @validated="itemMetadata.price && replicate(itemMetadata.price + ' and ' + (itemMetadata.publicPrice ? $t('product_item.public') : $t('product_item.private')))"
    />

    <base-switcher
      v-model="itemMetadata.publicPrice"
      :true-text="$t('product_item.public')"
      :false-text="$t('product_item.private')"
      class="flex-shrink-0"
    />
  </cw-product-item-metadata-modal-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    currencySymbol: { type: String, default: '$' }
  },
  methods: {
    show () {
      this.$refs.modal.show()
    }
  }
}
</script>
