<template>
  <div v-if="editor" class="cw-text-editor flex flex-col">
    <menu-bar :editor="editor" class="flex-shrink-0" />

    <base-scroll class="flex-grow cw-text-editor__content">
      <editor-content :editor="editor" class="cw-rich-text h-full" />
    </base-scroll>

    <menu-bubble v-if="!disabled" :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from 'tiptap'
import MenuBar from './organisms/MenuBar'
import MenuBubble from './organisms/MenuBubble'
import customizedExtensions from './extensions'
export default {
  components: {
    MenuBar,
    EditorContent,
    MenuBubble
  },
  props: {
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    imageUploader: { type: Function, default: null },
    // [{ text: '', value: '' }]
    dynamicFields: { type: Array, default: () => [] },
    dynamic: Boolean,
    noHtml: Boolean,
    autofocus: Boolean,
    disabled: Boolean
  },
  data () {
    return {
      editor: new Editor({
        content: this.value,
        editable: !this.disabled,
        useBuiltInExtensions: false,
        disableInputRules: true,
        disablePasteRules: true,

        onUpdate: ({ getHTML, getJSON }) => {
          const val = getHTML() || ''
          if (val.length < 200) {
            const $div = document.createElement('div')
            $div.innerHTML = val
            if (!$div.textContent.trim()) {
              return this.$emit('input', '')
            }
          }
          this.$emit('input', val)
        },

        onFocus: () => this.$emit('focus'),

        onBlur: () => this.$emit('blur'),

        extensions: customizedExtensions({
          image: { uploader: this.imageUploader },
          placeholder: {
            emptyNodeClass: 'is-empty',
            emptyNodeText: this.placeholder
          },
          dynamic_field: {
            disabled: false,
            fields: this.dynamicFields,
            dynamic: this.dynamic
          }
        }, { disabled: this.noHtml })
      })
    }
  },
  watch: {
    value (val) {
      if (val !== this.editor.getHTML()) {
        this.editor && this.editor.setContent(val)
      }
    },
    disabled (val) {
      this.editor && this.editor.setOptions({
        editable: !val
      })
    },
    dynamicFields (fields) {
      this.editor.extensions.options.dynamic_field.fields = fields
    },
    dynamic (v) {
      this.editor.extensions.options.dynamic_field.dynamic = v
    }
  },
  beforeDestroy () {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  mounted () {
    if (this.autofocus && this.editor) {
      this.focus()
    }
  },
  methods: {
    focus () {
      this.editor && this.editor.focus('end')
    }
  }
}
</script>

<style lang="scss">
.cw-text-editor {
  position: relative;

  &__content {
    background: white;
    color: black;

    &:focus {
      outline: none;
    }

    table {
      .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: "";
        left: 0; right: 0; top: 0; bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
      }

      .column-resize-handle {
        position: absolute;
        right: -2px; top: 0; bottom: 0;
        width: 4px;
        z-index: 20;
        background-color: #adf;
        pointer-events: none;
      }
    }
  }

  .ProseMirror {
    cursor: text;
    min-height: 6rem;
    height: 100%;
    overflow: auto;
    padding: 6px 12px;

    // Placeholder
    p.is-empty:first-child::before {
      content: attr(data-empty-text);
      float: left;
      pointer-events: none;
      height: 0;
      opacity: .5;
    }

    &.resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
  }
}
</style>
