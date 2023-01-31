<template>
  <div>
    <default-btn
      icon="editor/external-link-alt"
      :tooltip="$t('editor.url_new_tab')"
      @click="openLink"
    />

    <default-btn
      icon="editor/unlink"
      :tooltip="$t('editor.url_unlink')"
      @click="unlink"
    />
  </div>
</template>

<script>
import DefaultBtn from '../molecules/DefaultBtn'
export default {
  components: {
    DefaultBtn
  },
  props: {
    editorContext: { type: Object, default: () => ({}) }
  },
  methods: {
    openLink () {
      const { getMarkAttrs } = this.editorContext
      const linkAttrs = getMarkAttrs('link')

      window.open(linkAttrs.href, '_blank', 'noopener')
    },
    unlink () {
      this.editorContext.commands.link({})
    }
  }
}
</script>
