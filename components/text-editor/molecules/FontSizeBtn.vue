<template>
  <base-menu
    :items="sizes"
    :active-index="activeSizeIndex"
    boundary=".cw-text-editor"
    show-on-focus
    class="inline-block"
    @item-click="setSize"
  >
    <template #activator>
      <default-btn v-bind="$attrs" menu />
    </template>
  </base-menu>
</template>

<script>
import { findActiveFontSize } from '../utils/font_size'
import DefaultBtn from './DefaultBtn'
export default {
  components: {
    DefaultBtn
  },
  inheritAttrs: false,
  props: {
    command: { type: Function, default: null },
    editor: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      sizes: [
        '75%',
        '100%',
        '125%',
        '150%',
        '200%'
      ]
    }
  },
  computed: {
    activeSizeIndex () {
      const s = findActiveFontSize(this.editor.state) || '100%'
      return this.sizes.indexOf(s)
    }
  },
  methods: {
    setSize (size) {
      this.command(size === '100%' ? '' : size)
    }
  }
}
</script>
