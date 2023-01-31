<template>
  <base-input-autocomplete
    v-bind="$attrs"
    :debounce-duration="300"
    item-value="_id"
    item-text="name"
    :items="suggestedProducts"
    :rules="{
      maxLength: v => !v || v.length <= 50 || 'Max 50 chars',
      minLength: v => !v || v.length >= 2 || 'Min 2 chars',
      ...$attrs.rules
    }"
    v-on="$listeners"
    @search="search"
    @item-select="onProductSelected"
  />
</template>

<script>
import { mapState } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    useSuggestions: Boolean
  },
  data () {
    return {
      suggestedProducts: []
    }
  },
  computed: mapState('product', ['products']),
  methods: {
    async search (keyword) {
      if (this.useSuggestions && keyword?.length > 2) {
        this.suggestedProducts = await this.$repos.productRepo.searchProductsByName(keyword)
      } else {
        this.suggestedProducts = []
      }
    },

    onProductSelected (product) {
      const detailedProduct = this.products.find(p => p._id === product._id)
      if (detailedProduct) {
        detailedProduct && this.$emit('existed', detailedProduct)
        this.suggestedProducts = []
      }
    }
  }
}
</script>
