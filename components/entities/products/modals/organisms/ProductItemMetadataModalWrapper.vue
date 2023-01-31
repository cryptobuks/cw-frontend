<template>
  <base-modal
    ref="modal"
    :title="$t('global.manage') + ' ' + (product.name || '') + ' ' + metadataType"
    :disabled="disabled"
    v-bind="$attrs"
    @done="done"
  >
    <cw-product-item-replicate-popup
      ref="replicatePopup"
      :product-name="product.name"
      :product-items="product.items"
      @done="onReplicatePopupDone"
    />

    <base-form v-slot="{ rules }">
      <div
        v-for="(item, i) in product.items"
        :key="item.key"
        class="mb-6 flex justify-between items-center"
      >
        <slot
          name="item"
          :product-item="item"
          :item-metadata="draftItemsMetadata[i]"
          :replicate="(text) => replicate(draftItemsMetadata[i], text)"
        >
          <div class="mr-auto flex-shrink-0 whitespace-nowrap text-lg">
            {{ item.color.name }} {{ item.size.name }}
          </div>

          <slot
            :rules="rules"
            :product-item="item"
            :item-metadata="draftItemsMetadata[i]"
            :replicate="(text) => replicate(draftItemsMetadata[i], text)"
          />
        </slot>
      </div>
    </base-form>
  </base-modal>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    product: { type: Object, required: true },
    metadataType: { type: String, required: true },
    fields: { type: Array, required: true }
  },
  data () {
    return {
      draftItemsMetadata: [],
      prices: {},
      publicStates: {}
    }
  },
  computed: {
    disabled () {
      const requiredFields = this.fields.filter(f => f.required)
      return requiredFields.length > 0 &&
        this.draftItemsMetadata.some(item => requiredFields.some(f => this.$utils.isEmpty(item[f.name])))
    }
  },
  methods: {
    show () {
      this.draftItemsMetadata = this.product.items.map(
        item => this.$utils.extract(item, [
          'key',
          ...this.fields.map(f => ({
            from: f.name,
            default: f.default || (f.default !== undefined ? f.default : null)
          }))
        ])
      )

      this.$refs.modal.show()
    },

    hide () {
      this.$refs.modal.hide()
    },

    replicate (draftItemMetadata, text) {
      setTimeout(() => {
        const metadata = this.$utils.except(draftItemMetadata, 'key')
        if (!this.fields.some(f => f.required && this.$utils.isEmpty(metadata[f.name]))) {
          this.$refs.replicatePopup?.show?.(metadata, text)
        }
      }, 100)
    },

    onReplicatePopupDone (productItems) {
      this.draftItemsMetadata = this.draftItemsMetadata.map(prod => ({
        ...prod,
        ...productItems.find(p => p.key === prod.key)
      }))

      this.$emit('change', this.draftItemsMetadata)
    },

    done () {
      this.$emit('done', this.draftItemsMetadata)
      this.hide()
    }
  }
}
</script>
