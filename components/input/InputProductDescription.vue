<template>
  <base-input-autocomplete
    v-bind="$attrs"
    textarea
    :debounce-duration="300"
    item-text="description"
    :items="items"
    :rules="{
      maxLength: v => !v || v.length <= 300 || 'Max 300 chars',
      minLength: v => !v || v.length >= 3 || 'Min 3 chars',
      ...$attrs.rules
    }"
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
  computed: mapState('product', ['products']),
  methods: {
    search (keyword) {
      if (keyword?.length >= 3) {
        const items = []
        for (const { description } of this.products) {
          if (description && description.toLowerCase().includes(keyword)) {
            items.push(description)
            if (items.length === 7) {
              break
            }
          }
        }
        this.items = items
      } else {
        this.items = []
      }
    }
  }
}
</script>
