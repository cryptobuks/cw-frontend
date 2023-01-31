<template>
  <editor-menu-bubble
    v-slot="editorContext"
    :editor="editor"
    :keep-in-bound="false"
  >
    <div
      class="cw-text-editor__bubble"
      :class="{ 'cw-text-editor__bubble--hidden': !editorContext.menu.isActive || !shouldShowLinkMenu }"
      :style="{
        left: `${ editorContext.menu.left }px`,
        bottom: `${ editorContext.menu.bottom + 4 }px`
      }"
    >
      <menu-bubble-link
        v-if="shouldShowLinkMenu"
        :editor-context="editorContext"
      />
    </div>
  </editor-menu-bubble>
</template>

<script>
import { EditorMenuBubble } from 'tiptap'
import { getMarkRange } from 'tiptap-utils'
import MenuBubbleLink from './MenuBubbleLink'
export default {
  components: {
    EditorMenuBubble,
    MenuBubbleLink
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['editor'],
  computed: {
    shouldShowLinkMenu () {
      const { state, schema } = this.editor

      if (schema.marks.link) {
        const { tr } = state
        const { selection } = tr

        if (!selection) {
          return false
        }

        const { $from, $to } = selection
        const range = getMarkRange($from, schema.marks.link)
        if (!range) {
          return false
        }

        return range.to === $to.pos
      }
      return false
    }
  }
}
</script>

<style lang="scss">
.cw-text-editor__bubble {
  @apply bg-gray-750 absolute z-50 rounded-5px transform -translate-x-1/2;

  &--hidden {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
