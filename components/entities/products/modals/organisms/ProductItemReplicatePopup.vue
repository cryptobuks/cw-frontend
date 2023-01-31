<template>
  <base-confirm-popup
    ref="popup"
    :title="$t('product_item.replicate_popup.title', { type: text })"
    :actions="[
      { icon: 'dismiss', class: 'text-xl', handler: () => $refs.popup.hide() },
      { text: 'APPLY', handler: done, class: 'text-4xl' }
    ]"
  >
    <div class="text-center">
      <div class="inline-block mx-auto mb-6">
        <base-radio-group
          v-model="choice"
          :items="choices"
          item-class="mb-2"
          light
        />
      </div>

      <base-checkbox
        v-model="disabled"
        square
        light
        :label="$t('product_item.replicate_popup.not_show_again')"
        class="transform scale-75"
      />
    </div>
  </base-confirm-popup>
</template>

<script>
export default {
  props: {
    productName: { type: String, required: true },
    productItems: { type: Array, required: true }
  },
  data () {
    return {
      choice: null,
      choices: [],
      disabled: false,
      text: ''
    }
  },
  methods: {
    show (value, text) {
      if (this.disabled || this.productItems.length <= 1) {
        return
      }

      this.text = text || ''
      this.disabled = true

      const colors = Array.from(new Set(this.productItems.map(item => item.color.name)))
      const sizes = Array.from(new Set(this.productItems.map(item => item.size.name)))

      const allText = this.$t('product_item.replicate_popup.all') + ' '
      this.choices = [
        {
          value: 1,
          text: allText + this.productName,
          metadata: { value, colors, sizes }
        },
        ...colors.map((color, i) => ({
          value: i + 2,
          text: allText + color + ' ' + this.productName,
          metadata: { value, colors: [color] }
        })),
        ...sizes.map((size, i) => ({
          value: i + 2 + colors.length,
          text: allText + size + ' ' + this.productName,
          metadata: { value, sizes: [size] }
        })),
        {
          value: 4,
          text: this.$t('product_item.replicate_popup.none')
        }
      ]

      this.choice = 1

      this.$refs.popup.show()
    },

    done () {
      const { metadata: { value, colors = [], sizes = [] } = {} } = this.choices.find(c => c.value === this.choice) || {}
      const items = this.productItems.filter(item => colors.includes(item.color.name) || sizes.includes(item.size.name))
      this.$emit('done', items.map(item => ({
        key: item.key,
        ...value
      })))

      this.$refs.popup.hide()
    }
  }
}
</script>
