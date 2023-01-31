import { Italic as TiptapItalic } from 'tiptap-extensions'

export default class Italic extends TiptapItalic {
  menuBtnView () {
    return {
      icon: 'editor/italic',
      tooltip: 'editor.italic',
      computed: ({ commands, isActive }) => ({
        command: commands.italic,
        isActive: isActive.italic()
      })
    }
  }
}
