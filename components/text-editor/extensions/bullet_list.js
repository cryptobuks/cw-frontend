import { BulletList as TiptapBulletList } from 'tiptap-extensions'

export default class BulletList extends TiptapBulletList {
  menuBtnView () {
    return {
      icon: 'editor/list',
      tooltip: 'editor.bullet_list',
      computed: ({ isActive, commands }) => ({
        isActive: isActive.bullet_list(),
        command: commands.bullet_list
      })
    }
  }
}
