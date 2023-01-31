import { OrderedList as TiptapOrderedList } from 'tiptap-extensions'

export default class OrderedList extends TiptapOrderedList {
  menuBtnView () {
    return {
      icon: 'editor/list-ol',
      tooltip: 'editor.ordered_list',
      computed: ({ isActive, commands }) => ({
        isActive: isActive.ordered_list(),
        command: commands.ordered_list
      })
    }
  }
}
