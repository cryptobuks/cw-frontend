<template>
  <base-menu
    v-if="isActive"
    :items="editActions"
    boundary=".cw-text-editor"
    show-on-focus
    class="inline-block"
    @item-click="item => item.handler()"
  >
    <template #activator>
      <default-btn v-bind="$attrs" menu />
    </template>

    <template #item-text="{ item }">
      <span class="px-2 py-1">
        {{ item.text }}
      </span>
    </template>
  </base-menu>

  <default-btn v-else v-bind="$attrs" @click="inputFile" />
</template>

<script>
import { deleteSelection } from 'prosemirror-commands'
import { readFileDataUrl } from '../utils/shared'
import { ImageDisplay } from '../constants'
import DefaultBtn from './DefaultBtn'
export default {
  components: {
    DefaultBtn
  },

  inheritAttrs: false,

  props: {
    isActive: Boolean,
    command: { type: Function, default: null },
    editor: { type: Object, default: () => ({}) }
  },

  data () {
    return {
      editActions: [
        { text: this.$t('editor.image_inline'), handler: () => this.setDisplay(ImageDisplay.INLINE) },
        { text: this.$t('editor.image_break_text'), handler: () => this.setDisplay(ImageDisplay.BREAK_TEXT) },
        { text: this.$t('editor.image_float_left'), handler: () => this.setDisplay(ImageDisplay.FLOAT_LEFT) },
        { text: this.$t('editor.image_float_right'), handler: () => this.setDisplay(ImageDisplay.FLOAT_RIGHT) },
        { text: this.$t('editor.image_remove'), handler: this.remove }
      ]
    }
  },

  methods: {
    async inputFile () {
      const file = await this.$inputFile({ accept: 'image/*' })

      if (file && file.size <= 1024 * 1024 * 5) {
        this.command({ src: await readFileDataUrl(file), file })
      }
    },

    setDisplay (display) {
      const { state, dispatch } = this.editor.view
      setTimeout(() => {
        const transaction = state.tr.setNodeMarkup(state.selection.anchor, null, {
          ...state.selection.node.attrs,
          display
        })

        dispatch(transaction)
      }, 100)
    },

    remove () {
      const { state, dispatch } = this.editor.view
      setTimeout(() => {
        deleteSelection(state, dispatch)
      }, 100)
    }
  }
}
</script>
