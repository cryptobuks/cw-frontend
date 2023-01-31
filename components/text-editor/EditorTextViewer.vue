<template>
  <p class="cw-rich-text" v-html="parsedValue" />
</template>

<script>
export default {
  props: {
    value: { type: String, default: '' },
    dynamicEntities: { type: Object, default: () => null }
  },
  computed: {
    parsedValue () {
      if (!this.dynamicEntities || !Object.keys(this.dynamicEntities).length) {
        return this.value
      }

      const $div = document.createElement('div')
      $div.innerHTML = this.value
      const $dynamicFields = Array.from($div.querySelectorAll('[data-field]'))
      $dynamicFields.forEach(($field) => {
        const path = $field.getAttribute('data-field')
        const text = this.getDeepProp(this.dynamicEntities, path)
        if (text) {
          const $text = document.createTextNode(text)
          $field.parentNode.replaceChild($text, $field)
        } else {
          $field.parentNode.removeChild($field)
        }
      })

      return $div.innerHTML
    }
  },
  methods: {
    getDeepProp (obj, path) {
      const keys = path.split('.').map(s => s.trim()).filter(Boolean)
      try {
        return keys.reduce((x, y) => x[y], obj)
      } catch (_) {
        return null
      }
    }
  }
}
</script>
