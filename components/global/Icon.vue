
<script>
export default {
  props: {
    // Name of the icon, must be name of a svg file that exists in assets/icons directory
    // or sub directories
    name: { type: String, default: null },

    // Icon size, in px
    size: { type: [Number, String], default: null },

    // Rotation degree
    rotate: { type: [Number, String], default: 0 },

    // Turn this component into a renderless component which exports a scoped slot
    // with the icon's raw html as a prop
    renderless: Boolean,

    // Replace values in the svg source
    // example {'text':'13Kg'}    replace [[text]] with  13Kg
    replace: { type: Object, default: () => { return {} } }
  },
  computed: {
    iconName () {
      return this.name
        ? this.name.trim()
        : this.$slots.default && this.$slots.default.length
          ? this.$slots.default[0].text.trim()
          : null
    },

    raw () {
      return this.iconName ? this.getRawIcon(this.iconName) : null
    },

    attrs () {
      const output = {}

      if (this.raw) {
        const attributes = Array.from(this.raw.attributes)
        for (const attr of attributes) {
          output[attr.name] = attr.value
        }
      }

      return output
    },

    styleStr () {
      let styles = ''
      if (this.size) {
        styles += `font-size: ${this.size}px;`
      }
      if (this.rotate) {
        styles += `transform: rotate(${this.rotate}deg);`
      }
      return styles
    },

    content () {
      let content = this.raw ? this.raw.innerHTML : ''

      for (const key in this.replace) {
        content = content.replace(new RegExp(`\\[\\[${key}\\]\\]`, 'gm'), this.replace[key])
      }

      return content
    }
  },
  methods: {
    getRawIcon (iconName) {
      let raw = null
      try {
        raw = require(`~/assets/icons/${iconName}.svg?raw`)
      } catch (e) {
        return raw
      }

      const $div = document.createElement('div')
      $div.innerHTML = raw

      const $raw = $div.firstElementChild

      if ($raw.getAttribute('fill') !== 'none') {
        $raw.setAttribute('fill', 'currentColor')
      }

      $raw.classList.remove(...$raw.classList)
      $raw.classList.add('base-icon', `icon-${iconName}`)
      $raw.style.cssText = ''

      for (const child of Array.from($raw.children)) {
        const tagName = child.tagName ? child.tagName.toLowerCase() : null
        if (tagName === 'title' || tagName === 'desc') {
          $raw.removeChild(child)
        }
      }

      return $raw
    }
  },
  render (h) {
    if (this.renderless && this.$scopedSlots.default) {
      return this.$scopedSlots.default({
        rawIcon: this.raw.parentNode.innerHTML
      })
    }

    return h('svg', {
      class: this.raw ? [...this.raw.classList] : [],
      style: this.styleStr,
      attrs: this.attrs,
      on: this.$listeners,
      domProps: {
        innerHTML: this.content
      }
    })
  }
}
</script>

<style lang="scss">
.base-icon {
  width: 1em;
  height: 1em;
  display: inline;
  transition: none;
  vertical-align: middle;
  user-select: none;
}
</style>
