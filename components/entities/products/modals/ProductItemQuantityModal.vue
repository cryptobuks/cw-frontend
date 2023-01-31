<template>
  <cw-product-item-metadata-modal-wrapper
    ref="modal"
    v-slot="{ replicate, itemMetadata }"
    v-bind="$attrs"
    :metadata-type="$t('product_item.quantities')"
    :fields="[
      { name: 'lastSupplierId', default: null },
      { name: 'lastCost', default: null },
      { name: 'quantity', default: 0 }
    ]"
    v-on="$listeners"
  >
    <div class="flex items-center flex-grow justify-end h-13 pl-6">
      <template v-if="itemMetadata.quantity > 0">
        <cw-input-product-item-supplier
          v-model="itemMetadata.supplier"
          :label="$t('product_item.supplier.label')"
          :tooltip="$t('product_item.supplier.tooltip')"
          class="mx-6 md:ml-0 flex-shrink-0"
          style="margin-bottom: 0; max-width: 160px;"
          @blur="callReplicate(replicate, itemMetadata)"
        />

        <base-input-text
          v-model="itemMetadata.cost"
          :label="$t('product_item.cost.label')"
          :tooltip="$t('product_item.cost.tooltip')"
          type="number"
          min="0"
          max="99999"
          class="mr-6"
          style="margin-bottom: 0; max-width: 120px;"
          @blur="callReplicate(replicate, itemMetadata)"
        />
      </template>

      <base-input-quantity
        v-model="itemMetadata.quantity"
        class="flex-shrink-0"
        @blur="callReplicate(replicate, itemMetadata)"
      />
    </div>
  </cw-product-item-metadata-modal-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  methods: {
    show () {
      this.$refs.modal.show()
    },

    callReplicate (replicate, item) {
      replicate(
        [
          item.quantity,
          [
            item.supplier,
            item.cost
          ].filter(Boolean).join(' and ')
        ].filter(v => v !== null || typeof v === 'number').joni(', ')
      )
    }
  }
}
</script>
