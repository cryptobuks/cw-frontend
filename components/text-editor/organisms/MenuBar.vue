<template>
  <editor-menu-bar
    v-slot="editorContext"
    :editor="editor"
  >
    <div class="cw-text-editor__toolbar">
      <div
        ref="items"
        v-swipe="{
          captureX: true,
          mobile: false,
          onSwipe,
          onSwipeEnded
        }"
        class="cw-text-editor__toolbar__items"
      >
        <template v-for="(specs, i) in groups">
          <template v-for="(spec, j) in specs">
            <component
              :is="spec.component || 'default-btn'"
              :key="i + '_' + j"
              :icon="spec.icon"
              :tooltip="spec.tooltip"
              class="cw-text-editor__toolbar__item"
              v-bind="spec.computed ? spec.computed(makeComputedArgs(editorContext)) : {}"
              v-on="spec.componentEvents"
            />
          </template>
        </template>

        <slot v-bind="makeComputedArgs(editorContext)" />
      </div>

      <base-transition name="fade" :active="leftNavState || rightNavState">
        <span
          class="cw-text-editor__toolbar__nav"
          :class="{ right: rightNavState }"
          @click="onNavClick"
        >
          <base-icon :name="leftNavState ? 'chevron-left' : 'chevron-right'" />
        </span>
      </base-transition>
    </div>
  </editor-menu-bar>
</template>

<script>
import { EditorMenuBar } from 'tiptap'
import { menuButtonGroups } from '../extensions'
import DefaultBtn from '../molecules/DefaultBtn'
export default {
  components: {
    EditorMenuBar,
    DefaultBtn
  },
  props: {
    editor: { type: Object, required: true }
  },
  data () {
    const editor = this.editor
    const extensions = editor.extensions.extensions.reduce((acc, extension) => {
      if (typeof extension.menuBtnView === 'function') {
        acc[extension.name] = extension.menuBtnView.bind(extension)
      }
      return acc
    }, {})

    const groups = menuButtonGroups.map(group => group.reduce((items, cur) => {
      return extensions[cur]
        ? items.concat(extensions[cur]())
        : items
    }, []))

    return {
      groups,

      leftNavState: false,
      rightNavState: false,

      tmpScrollLeft: null
    }
  },
  mounted () {
    this.checkHeaderOverflow()
    window.addEventListener('resize', this.checkHeaderOverflow)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.checkHeaderOverflow)
  },
  methods: {
    checkHeaderOverflow () {
      const { scrollWidth, offsetWidth, scrollLeft } = this.$refs.items
      this.leftNavState = scrollLeft && offsetWidth < scrollWidth
      this.rightNavState = scrollLeft + offsetWidth < scrollWidth
    },

    makeComputedArgs (editorContext) {
      const editor = this.editor

      return Object.assign({
        editor,
        selectionEmpty: editor.view.state.selection.empty
      }, editorContext)
    },

    onNavClick () {
      const scrollTo = this.leftNavState ? 0 : this.$refs.items.scrollWidth
      this.leftNavState = !this.leftNavState
      this.rightNavState = !this.rightNavState
      this.scrollHorizontally(this.$refs.items, scrollTo)
    },

    scrollHorizontally (el, scrollTo = 0, duration = 400) {
      const { scrollLeft } = el
      const pixels = scrollTo - scrollLeft
      const startTime = 'now' in window.performance ? performance.now() : new Date().getTime()
      function scroll (timestamp) {
        const timeElapsed = timestamp - startTime
        const progress = Math.min(timeElapsed / duration, 1)
        el.scrollLeft = scrollLeft + pixels * progress
        return timeElapsed < duration && window.requestAnimationFrame(scroll)
      }
      window.requestAnimationFrame(scroll)
    },

    onSwipe ({ x, y }) {
      const $body = this.$refs.items
      if (typeof this.tmpScrollLeft !== 'number') {
        this.tmpScrollLeft = $body.scrollLeft
      }

      $body.scrollLeft = Math.min($body.scrollWidth, Math.max(0, this.tmpScrollLeft - x))
      this.leftNavState = $body.scrollLeft > 0
      this.rightNavState = $body.scrollLeft + $body.clientWidth < $body.scrollWidth
    },

    onSwipeEnded () {
      this.tmpScrollLeft = null
    }
  }
}
</script>

<style lang="scss">
.cw-text-editor__toolbar {
  position: relative;
  width: 100%;
  font-size: 16px;

  @apply bg-gray-700;

  &__items {
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__item {
    height: 40px;
    min-width: 40px;
  }

  &__nav {
    position: absolute;
    top: 0;
    left: 0;
    height: 40px;
    width: 32px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: .3s;

    @apply bg-gray-800 text-white text-opacity-70;

    &:hover {
      color: #fff;
    }

    &.right {
      right: 0;
      left: unset;
    }
  }
}
</style>
