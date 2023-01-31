import { setTextAlign } from './text_align'
import { setTextLineHeight } from './line_height'
import { setFontSize } from './font_size'

const FORMAT_MARK_NAMES = [
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'text_color',
  'text_highlight'
]

export function clearMarks (tr, schema) {
  const { doc, selection } = tr
  if (!selection || !doc) { return tr }

  const { from, to, empty } = selection
  if (empty) { return tr }

  const markTypesToRemove = new Set(
    FORMAT_MARK_NAMES.map(n => schema.marks[n]).filter(Boolean)
  )

  if (!markTypesToRemove.size) { return tr }

  const tasks = []
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.marks && node.marks.length) {
      node.marks.some((mark) => {
        if (markTypesToRemove.has(mark.type)) {
          tasks.push({ node, pos, mark })
        }
      })
      return true
    }
    return true
  })

  tasks.forEach((job) => {
    const { node, mark, pos } = job
    tr = tr.removeMark(pos, pos + node.nodeSize, mark.type)
  })

  tr = setTextAlign(tr, null)
  tr = setTextLineHeight(tr, null)
  tr = setFontSize(tr, schema.marks.font_size, null)

  return tr
}
