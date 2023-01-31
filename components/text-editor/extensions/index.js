import { Text } from 'tiptap'
import { Placeholder, HardBreak } from 'tiptap-extensions'

// nodes
import Doc from './doc'
import Paragraph from './paragraph'
import ListItem from './list_item'
import BulletList from './bullet_list'
import OrderedList from './ordered_list'
import Image from './image'
import Link from './link'
import DynamicField from './dynamic_field'

// marks
import FontSize from './font_size'
import Bold from './bold'
import Underline from './underline'
import Italic from './italic'
import Strike from './strike'

// extensions
import History from './history'
import TextAlign from './text_align'
import FormatClear from './format_clear'

const mandatoryExtensions = [
  Doc,
  Text,
  Paragraph,
  Placeholder,
  ListItem
]

const extensions = {
  Doc,
  Text,
  Paragraph,
  HardBreak,
  Placeholder,
  ListItem,
  DynamicField,
  FontSize,
  History,
  Bold,
  Underline,
  Italic,
  Strike,
  FormatClear,
  TextAlign,
  BulletList,
  OrderedList,
  Link,
  Image
}

/**
 * Init extensions
 *
 * @param {Object} opts Key value pairs in which:
 * - Key is the extension name in snake case
 * - Value is correspondant to the defaultOptions in the extension, plus a disabled prop
 *
 * @return initialized extensions
 */
export default (opts = {}, commonOpts = {}) => {
  const output = []

  Object.entries(extensions).forEach(([name, Extension]) => {
    const extensionName = toSnakeCase(name)

    const extensionOpts = {
      ...commonOpts,
      ...opts[extensionName]
    }

    if (mandatoryExtensions.includes(Extension) || !extensionOpts.disabled) {
      output.push(new Extension(extensionOpts))
    }
  })

  return output
}

// Order of extensions's buttons in the menu bars by group
export const menuButtonGroups = [
  ['dynamic_field'],
  ['font_size'],
  ['history'],
  ['bold', 'italic', 'underline', 'strike', 'format_clear'],
  ['text_align'],
  ['bullet_list', 'ordered_list'],
  ['link', 'image']
]

function toSnakeCase (str) {
  let output = ''
  for (let i = 0; i < str.length; i++) {
    if (str[i] === str[i].toUpperCase()) {
      if (i > 0) {
        output += '_'
      }
      output += str[i].toLowerCase()
    } else {
      output += str[i]
    }
  }
  return output
}
