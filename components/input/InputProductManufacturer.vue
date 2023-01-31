<template>
  <base-input-autocomplete
    v-bind="$attrs"
    :debounce-duration="300"
    item-text="displayName"
    :items="items"
    v-on="$listeners"
    @search="search"
  />
</template>

<script>
import { mapState } from 'vuex'
export default {
  inheritAttrs: false,
  data () {
    return {
      items: []
    }
  },
  computed: {
    ...mapState('product', ['products']),

    manufacturers () {
      return this.products.map(p => p.manufacturer).filter(Boolean)
    }
  },
  methods: {
    search (keyword) {
      if (keyword?.length >= 3) {
        this.items = this.manufacturers.filter(m => m.toLowerCase().includes(keyword))
      } else {
        this.items = []
      }
    }
  }
}
</script>
