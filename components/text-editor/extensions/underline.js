import { Underline as TiptapUnderline } from 'tiptap-extensions'

export default class Underline extends TiptapUnderline {
  menuBtnView () {
    return {
      icon: 'editor/underline',
      tooltip: 'editor.underline',
      computed: ({ isActive, commands }) => ({
        command: commands.underline,
        isActive: isActive.underline()
      })
    }
  }
}
