
export const Alignment = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify'
}
export const ALIGN_PATTERN = new RegExp(`(${Alignment.left}|${Alignment.center}|${Alignment.right}|${Alignment.justify})`)

export const LINE_HEIGHT_100 = 1.7
export const DEFAULT_LINE_HEIGHT = '100%'

export const PREVIEW_WINDOW_WIDTH = '80vw'

export const ImageDisplay = {
  INLINE: null,
  BREAK_TEXT: 'block',
  FLOAT_LEFT: 'left',
  FLOAT_RIGHT: 'right'
}
