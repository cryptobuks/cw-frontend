import { Bold as TiptapBold } from 'tiptap-extensions'

export default class Bold extends TiptapBold {
  menuBtnView () {
    return {
      icon: 'editor/bold',
      tooltip: 'editor.bold',
      computed: ({ isActive, commands }) => ({
        command: commands.bold,
        isActive: isActive.bold()
      })
    }
  }
}
