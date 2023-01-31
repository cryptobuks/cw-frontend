import { Strike as TiptapStrike } from 'tiptap-extensions'

export default class Strike extends TiptapStrike {
  menuBtnView () {
    return {
      icon: 'editor/strikethrough',
      tooltip: 'editor.strike_through',
      computed: ({ isActive, commands }) => ({
        command: commands.strike,
        isActive: isActive.strike()
      })
    }
  }
}
