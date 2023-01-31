import { Node } from 'tiptap'
import DynamicFieldBtn from '../molecules/DynamicFieldBtn.vue'

export default class DynamicField extends Node {
  get name () {
    return 'dynamic_field'
  }

  get defaultOptions () {
    return {
      // [{ text: '', value: '' }]
      fields: [],

      // Use prompt to enter key instead of choosing from fields
      dynamic: false
    }
  }

  get schema () {
    return {
      inline: true,
      group: 'inline',
      attrs: {
        text: {
          default: null
        },
        value: {
          default: null
        }
      },
      draggable: false,
      selectable: false,
      parseDOM: [
        {
          tag: '[data-field]',
          getAttrs: dom => ({
            text: (dom.textContent || '').trim(),
            value: dom.getAttribute('data-field') || null
          })
        }
      ],
      toDOM: node => ['span', {
        'data-field': node.attrs.value
      }, node.attrs.text]
    }
  }

  commands ({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos
      const node = type.create(attrs)
      const transaction = state.tr.insert(position, node)
      dispatch(transaction)
    }
  }

  menuBtnView () {
    return {
      component: DynamicFieldBtn,
      icon: 'add',
      tooltip: 'editor.dynamic_field',
      computed: ({ commands, editor }) => ({
        command: commands.dynamic_field,
        editor
      })
    }
  }
}
