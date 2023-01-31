import { Plugin, TextSelection } from 'prosemirror-state'
import { Link as TiptapLink } from 'tiptap-extensions'
import { updateMark, removeMark } from 'tiptap-commands'
import { getMarkRange } from 'tiptap-utils'
import LinkBtn from '../molecules/LinkBtn.vue'

export default class Link extends TiptapLink {
  commands ({ type }) {
    return (attrs) => {
      if (attrs.href) {
        try {
          return updateMark(type, attrs)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('[EDITOR]', e)
        }
      }

      return removeMark(type)
    }
  }

  get plugins () {
    return [
      new Plugin({
        props: {
          handleClick (view, pos) {
            const { schema, doc, tr } = view.state

            const range = getMarkRange(doc.resolve(pos), schema.marks.link)

            if (!range) { return false }

            const $start = doc.resolve(range.from)
            const $end = doc.resolve(range.to)

            const transaction = tr.setSelection(new TextSelection($start, $end))

            view.dispatch(transaction)

            return true
          }
        }
      })
    ]
  }

  menuBtnView () {
    return {
      component: LinkBtn,
      icon: 'editor/link',
      tooltip: 'editor.url_insert',
      computed: ({ commands, isActive, selectionEmpty }) => ({
        isActive: isActive.link(),
        command: commands.link,
        disabled: selectionEmpty
      })
    }
  }
}
