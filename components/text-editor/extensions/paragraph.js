import { Paragraph as TiptapParagraph } from 'tiptap'
import { transformLineHeightToCSS } from '../utils/line_height'
import { ALIGN_PATTERN, LINE_HEIGHT_100 } from '../constants'

export const ParagraphNodeSpec = {
  attrs: {
    textAlign: { default: null },
    indent: { default: null },
    lineHeight: { default: null }
  },
  content: 'inline*',
  group: 'block',
  parseDOM: [{
    tag: 'p',
    getAttrs
  }],
  toDOM
}

function getAttrs (dom) {
  const { textAlign, lineHeight } = dom.style
  const align = dom.getAttribute('data-text-align') || textAlign || ''

  return {
    textAlign: ALIGN_PATTERN.test(align) ? align : null,
    indent: parseInt(dom.getAttribute('data-indent'), 10) || 0,
    lineHeight: (lineHeight && lineHeight !== transformLineHeightToCSS(LINE_HEIGHT_100)) ? lineHeight : null
  }
}

function toDOM (node) {
  const {
    textAlign,
    indent,
    lineHeight
  } = node.attrs

  let style = ''
  const attrs = {}

  if (textAlign && textAlign !== 'left') {
    attrs['data-text-align'] = textAlign
  }

  if (indent) {
    attrs['data-indent'] = indent
  }

  if (lineHeight) {
    const cssLineHeight = transformLineHeightToCSS(lineHeight)
    style += `line-height: ${cssLineHeight}`
  }

  style && (attrs.style = style)

  return ['p', attrs, 0]
}

export default class Paragraph extends TiptapParagraph {
  get schema () {
    return ParagraphNodeSpec
  }
}

export const toParagraphDOM = toDOM
export const getParagraphNodeAttrs = getAttrs
