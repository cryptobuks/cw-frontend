<template>
  <base-select
    v-bind="$attrs"
    :debounce-duration="300"
    item-value="_id"
    item-text="displayName"
    :items="items"
    v-on="$listeners"
    @search="search"
    @item-select="onSuggestionSelected"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  data () {
    return {
      items: []
    }
  },
  methods: {
    async search (keyword) {
      if (keyword?.length >= 3) {
        this.items = await this.$repos.productRepo.searchSuppliersByName(keyword)
      } else {
        this.items = []
      }
    },

    onSuggestionSelected (supplier) {
      this.$emit('input', supplier._id)
    }
  }
}
</script>
