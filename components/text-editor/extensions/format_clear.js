import { Extension } from 'tiptap'
import { clearMarks } from '../utils/format_clear'

export default class FormatClear extends Extension {
  get name () {
    return 'format_clear'
  }

  commands () {
    return () => (state, dispatch) => {
      const tr = clearMarks(state.tr.setSelection(state.selection), state.schema)

      if (dispatch && tr.docChanged) {
        dispatch(tr)
        return true
      }
      return false
    }
  }

  menuBtnView () {
    return {
      icon: 'editor/remove-format',
      tooltip: 'editor.clear_format',
      computed: ({ commands, selectionEmpty }) => ({
        command: commands.format_clear,
        disabled: selectionEmpty
      })
    }
  }
}
