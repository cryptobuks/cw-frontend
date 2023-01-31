import { Image as TiptapImage } from 'tiptap-extensions'
import ImageBtn from '../molecules/ImageBtn.vue'
import ImageView from '../organisms/ImageView.vue'
import { ImageDisplay } from '../constants'

export default class Image extends TiptapImage {
  get defaultOptions () {
    return {
      uploader: null
    }
  }

  get schema () {
    return {
      inline: true,
      attrs: {
        src: {
          default: ''
        },
        width: {
          default: null
        },
        height: {
          default: null
        },
        display: {
          default: null
        },
        file: {
          default: null
        }
      },
      group: 'inline',
      draggable: true,
      parseDOM: [{
        tag: '.editor-image',
        getAttrs (dom) {
          const { cssFloat, display } = dom.style
          let { width, height } = dom.style

          let dp = dom.getAttribute('data-display') || dom.getAttribute('display')
          if (dp) {
            dp = /(left|right)/.test(dp) ? dp : null
          } else if (cssFloat === 'left' && !display) {
            dp = ImageDisplay.FLOAT_LEFT
          } else if (cssFloat === 'right' && !display) {
            dp = ImageDisplay.FLOAT_RIGHT
          } else {
            dp = null
          }

          width = width || dom.getAttribute('width') || null
          height = height || dom.getAttribute('height') || null

          return {
            src: dom.getAttribute('src') || '',
            width: width === null ? null : parseInt(width, 10),
            height: height === null ? null : parseInt(height, 10),
            display: dp
          }
        }
      }],
      toDOM: node => ['img', {
        'data-display': node.attrs.display,
        class: 'editor-image',
        src: node.attrs.src,
        width: node.attrs.width,
        height: node.attrs.height
      }]
    }
  }

  get view () {
    return ImageView
  }

  menuBtnView () {
    return {
      component: ImageBtn,
      icon: 'editor/image',
      tooltip: 'editor.image_insert',
      computed: ({ editor, commands, isActive }) => ({
        isActive: isActive.image(),
        command: commands.image,
        editor
      })
    }
  }
}
