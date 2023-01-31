<template>
  <cw-product-item-metadata-modal-wrapper
    ref="modal"
    v-slot="{ replicate, itemMetadata }"
    v-bind="$attrs"
    :metadata-type="$t('product_item.barcodes')"
    :fields="[
      { name: 'barCode', default: null },
    ]"
    v-on="$listeners"
  >
    <cw-input-barcode
      v-model="itemMetadata.barCode"
      :label="$t('product_item.barcode.label')"
      :tooltip="$t('product_item.barcode.tooltip')"
      class="ml-6"
      style="margin-bottom: 0; max-width: 300px;"
      @validated="itemMetadata.barCode && replicate(itemMetadata.barCode)"
    />
  </cw-product-item-metadata-modal-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  methods: {
    show () {
      this.$refs.modal.show()
    }
  }
}
</script>
