import { History as TiptapHistory } from 'tiptap-extensions'

export default class History extends TiptapHistory {
  menuBtnView () {
    return [
      {
        icon: 'editor/undo',
        tooltip: 'editor.undo',
        computed: ({ commands }) => ({
          command: commands.undo
        })
      },
      {
        icon: 'editor/redo',
        tooltip: 'editor.redo',
        computed: ({ commands }) => ({
          command: commands.redo
        })
      }
    ]
  }
}
