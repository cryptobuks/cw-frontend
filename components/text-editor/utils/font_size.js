import { TextSelection, AllSelection } from 'prosemirror-state'
import { getMarkAttrs } from 'tiptap-utils'
import applyMark from './apply_mark'

export function setFontSize (tr, type, size) {
  const { selection } = tr

  if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
    return tr
  }
  const attrs = size ? { size } : null
  tr = applyMark(tr, type, attrs)
  return tr
}

const DEFAULT_SIZE = ''

export function findActiveFontSize (state) {
  const { schema, selection, tr } = state
  const markType = schema.marks.font_size

  if (!markType) { return DEFAULT_SIZE }

  const { empty } = selection

  if (empty) {
    const storedMarks = tr.storedMarks ||
      state.storedMarks ||
      (
        selection instanceof TextSelection &&
        selection.$cursor &&
        selection.$cursor.marks &&
        selection.$cursor.marks()
      ) ||
      []

    const sm = storedMarks.find(m => m.type === markType)
    return (sm && sm.attrs.size) || DEFAULT_SIZE
  }

  const attrs = getMarkAttrs(state, markType)
  const fontSize = attrs.size

  if (!fontSize) { return DEFAULT_SIZE }

  return fontSize
}
