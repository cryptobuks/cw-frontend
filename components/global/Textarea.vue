<template>
  <base-input-wrapper v-bind="$attrs" class="base-textarea" v-on="$listeners">
    <template #default="{ inputAttrs, inputListeners, inputClass }">
      <textarea
        ref="textarea"
        :class="[inputClass]"
        :rows="rows"
        v-bind="inputAttrs"
        v-on="inputListeners"
      />
    </template>

    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    rows: { type: Number, default: 1 }
  },

  watch: {
    '$attrs.value': 'adjustHeight'
  },

  mounted () {
    this.adjustHeight()
  },

  methods: {
    adjustHeight () {
      const $textarea = this.$refs.textarea
      if ($textarea) {
        // Auto scale height according to content height
        $textarea.style.height = 'auto'

        if (this.$attrs.value) {
          const height = Math.max($textarea.scrollHeight, $textarea.clientHeight)
          if (height > 10) {
            $textarea.style.height = height + 'px'
          }
        }
      }
    },

    focus () {
      if (this.$refs.textarea) {
        this.$refs.textarea.focus()
      }
    }
  }
}
</script>

<style lang="scss">
.base-textarea {
  textarea {
    resize: none;
    display: block;
    overflow: hidden;
  }
}
</style>
