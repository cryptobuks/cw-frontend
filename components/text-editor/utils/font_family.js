import { TextSelection, AllSelection } from 'prosemirror-state'
import { getMarkAttrs } from 'tiptap-utils'
import applyMark from './apply_mark'

const DEFAULT_FONT_TYPE_NAMES = [
  'Arial',
  'Arial Black',
  'Georgia',
  'Impact',
  'Tahoma',
  'Times New Roman',
  'Verdana',
  'Courier New',
  'Lucida Console',
  'Monaco',
  'monospace'
]

export const DEFAULT_FONT_TYPE_MAP = DEFAULT_FONT_TYPE_NAMES.reduce((obj, type) => {
  obj[type] = type
  return obj
}, {})

export function setFontType (tr, type, name) {
  const { selection } = tr

  if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
    return tr
  }
  const attrs = name ? { name } : null
  tr = applyMark(tr, type, attrs)
  return tr
}

const DEFAULT_FONT_TYPE = ''

export function findActiveFontType (state) {
  const { schema, selection, tr } = state
  const markType = schema.marks.font_family

  if (!markType) { return DEFAULT_FONT_TYPE }

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
    return (sm && sm.attrs.name) || DEFAULT_FONT_TYPE
  }

  const attrs = getMarkAttrs(state, markType)
  const fontName = attrs.name

  if (!fontName) { return DEFAULT_FONT_TYPE }

  return fontName
}
