<template>
  <div :data-display="display" class="cw-text-editor__image editor-image">
    <span class="cw-text-editor__image__wrapper">
      <img
        :src="src"
        :width="width + 'px'"
        :height="height + 'px'"
        @click="selectImage"
      >

      <div
        v-if="view.editable"
        v-show="selected || resizing"
        class="cw-text-editor__image__resizer"
      >
        <span
          v-for="direction in resizeDirections"
          :key="direction"
          :class="`cw-text-editor__image__resizer__handler--${direction}`"
          class="cw-text-editor__image__resizer__handler"
          @mousedown.prevent.stop="onMouseDown($event, direction)"
          @touchstart.prevent.stop="onMouseDown($event.touches[0], direction)"
        />
      </div>
    </span>
  </div>
</template>

<script>
import { NodeSelection } from 'prosemirror-state'
import { resolveImg } from '../utils/image'

const MIN_SIZE = 20

export default {
  props: {
    node: { type: Object, default: () => ({}) },
    view: { type: Object, default: () => ({}) },
    getPos: { type: Function, default: null },
    updateAttrs: { type: Function, default: null },
    selected: Boolean,
    options: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      originalSize: {
        width: 0,
        height: 0
      },
      resizeDirections: [
        'tl',
        'tr',
        'bl',
        'br'
      ],
      resizing: false,
      resizerState: {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        dir: ''
      },

      uploading: false
    }
  },
  computed: {
    src () {
      return this.node.attrs.src
    },
    width () {
      return this.node.attrs.width
    },
    height () {
      return this.node.attrs.height
    },
    display () {
      return this.node.attrs.display
    }
  },
  async created () {
    const result = await resolveImg(this.src)
      .catch(e => ({}))

    if (!result.complete) {
      result.width = MIN_SIZE
      result.height = MIN_SIZE
    }

    this.setOriginalSize({
      width: result.width,
      height: result.height
    })

    this.handleUploadImage()
  },
  methods: {
    async handleUploadImage () {
      if (!this.node.attrs.file) {
        return
      }

      const { uploader } = this.options || {}
      if (!uploader) {
        return
      }

      this.uploading = true

      const { src } = await uploader(this.node.attrs.file) || {}

      src && this.updateAttrs({ src, file: null })

      this.uploading = false
    },
    setOriginalSize ({ width, height }) {
      const $editorContent = this.$parent.$el
      const maxW = $editorContent.clientWidth
      this.originalSize = maxW >= width
        ? { width, height }
        : { width: maxW, height: height / (width / maxW) }
    },
    // https://github.com/scrumpy/tiptap/issues/361#issuecomment-540299541
    selectImage () {
      const { state } = this.view
      let { tr } = state
      const selection = NodeSelection.create(state.doc, this.getPos())
      tr = tr.setSelection(selection)
      this.view.dispatch(tr)
    },
    onMouseDown ({ clientX, clientY }, dir) {
      this.resizerState.x = clientX
      this.resizerState.y = clientY

      const originalWidth = this.originalSize.width
      const originalHeight = this.originalSize.height
      const aspectRatio = originalWidth / originalHeight

      let { width, height } = this.node.attrs

      if (width && !height) {
        height = Math.round(width / aspectRatio)
      } else if (height && !width) {
        width = Math.round(height * aspectRatio)
      } else if (!width && !height) {
        width = originalWidth
        height = originalHeight
      }

      this.resizerState.w = width
      this.resizerState.h = height
      this.resizerState.dir = dir

      this.resizing = true

      this.onEvents()
    },
    onMouseMove (e) {
      e.preventDefault()
      e.stopPropagation()
      if (!this.resizing) {
        return
      }

      const coord = e.touches && e.touches[0] ? e.touches[0] : e

      const { x, y, w, h, dir } = this.resizerState

      const dx = (coord.clientX - x) * (/l/.test(dir) ? -1 : 1)
      const dy = (coord.clientY - y) * (/t/.test(dir) ? -1 : 1)

      this.updateAttrs({
        width: Math.max(w + dx, MIN_SIZE),
        height: Math.max(h + dy, MIN_SIZE)
      })
    },
    onMouseUp (e) {
      e.preventDefault()
      e.stopPropagation()
      if (!this.resizing) {
        return
      }

      this.resizing = false

      this.resizerState = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        dir: ''
      }

      this.offEvents()
      this.selectImage()
    },
    onEvents () {
      document.addEventListener('mousemove', this.onMouseMove, true)
      document.addEventListener('mouseup', this.onMouseUp, true)
      document.addEventListener('touchmove', this.onMouseMove, true)
      document.addEventListener('touchend', this.onMouseUp, true)
    },
    offEvents () {
      document.removeEventListener('mousemove', this.onMouseMove, true)
      document.removeEventListener('mouseup', this.onMouseUp, true)
      document.removeEventListener('touchmove', this.onMouseMove, true)
      document.removeEventListener('touchend', this.onMouseUp, true)
    }
  }
}
</script>

<style lang="scss">
.cw-text-editor__image {
  line-height: 0;
  display: inline-block;

  &__wrapper {
    position: relative;
    cursor: pointer;
    display: inline-flex;
  }

  &__resizer {
    border: 1px solid #59a2ed;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    &__handler {
      background: #59a2ed;
      border: 1px solid white;
      border-radius: 2px;
      display: block;
      height: 12px;
      width: 12px;
      position: absolute;

      &--tl {
        cursor: nw-resize;
        left: -6px;
        top: -6px;
      }

      &--tr {
        cursor: ne-resize;
        right: -6px;
        top: -6px;
      }

      &--bl {
        bottom: -6px;
        cursor: sw-resize;
        left: -6px;
      }

      &--br {
        bottom: -6px;
        cursor: se-resize;
        right: -6px;
      }
    }
  }
}
</style>
