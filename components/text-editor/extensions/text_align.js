import { Extension } from 'tiptap'
import { setTextAlign, isTextAlignActive } from '../utils/text_align'
import { Alignment, ALIGN_PATTERN } from '../constants'

const tooltips = {
  [Alignment.left]: 'left',
  [Alignment.center]: 'center',
  [Alignment.right]: 'right',
  [Alignment.justify]: 'justify'
}

export default class TextAlign extends Extension {
  get name () {
    return 'text_align'
  }

  get defaultOptions () {
    return {
      alignments: [
        Alignment.left,
        Alignment.center,
        Alignment.right,
        Alignment.justify
      ]
    }
  }

  commands () {
    return this.options.alignments.reduce((commands, alignment) => {
      if (!ALIGN_PATTERN.test(alignment)) {
        return commands
      }

      return {
        ...commands,
        [`align_${alignment}`]: () => (state, dispatch) => {
          const { selection } = state
          const tr = setTextAlign(
            state.tr.setSelection(selection),
            alignment === 'left' ? null : alignment
          )

          if (tr.docChanged) {
            dispatch && dispatch(tr)
            return true
          } else {
            return false
          }
        }
      }
    }, {})
  }

  menuBtnView () {
    return this.options.alignments.reduce((views, alignment) => {
      if (!ALIGN_PATTERN.test(alignment)) {
        return views
      }

      return views.concat({
        icon: `editor/align-${alignment}`,
        tooltip: 'editor.align_' + tooltips[alignment],

        computed: ({ commands, editor }) => ({
          isActive: alignment === 'left' ? false : isTextAlignActive(editor.state, alignment),
          command: commands[`align_${alignment}`]
        })
      })
    }, [])
  }
}
