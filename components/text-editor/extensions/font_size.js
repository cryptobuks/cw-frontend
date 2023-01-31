import { Mark } from 'tiptap'
import { setFontSize } from '../utils/font_size'
import FontSizeBtn from '../molecules/FontSizeBtn.vue'

export default class FontType extends Mark {
  get name () {
    return 'font_size'
  }

  get schema () {
    return {
      attrs: {
        size: ''
      },
      inline: true,
      group: 'inline',
      parseDOM: [
        {
          style: 'font-size',
          getAttrs: size => ({ size })
        }
      ],
      toDOM (node) {
        const { size } = node.attrs
        const attrs = {}

        if (size) {
          attrs.style = `font-size: ${size}`
        }

        return ['span', attrs, 0]
      }
    }
  }

  commands ({ type }) {
    return size => (state, dispatch) => {
      let { tr } = state

      tr = setFontSize(
        state.tr.setSelection(state.selection),
        type,
        size
      )

      if (tr.docChanged || tr.storedMarksSet) {
        dispatch && dispatch(tr)
        return true
      }

      return false
    }
  }

  menuBtnView () {
    return {
      component: FontSizeBtn,
      icon: 'editor/text-size',
      tooltip: 'editor.font_size',
      computed: ({ commands, editor }) => ({
        command: commands.font_size,
        editor
      })
    }
  }
}
