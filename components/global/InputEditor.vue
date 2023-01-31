<template>
  <base-input-wrapper
    class="base-input-editor"
    :label="label"
    :value="value"
    :naked="$attrs.naked || $attrs.naked === '' || noModal"
    :clearable="$attrs.clearable || $attrs.clearable === '' || !noModal"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template
      #default="{
        inputAttrs: { value: inputValue, ...attrs },
        inputListeners,
        inputClass
      }"
    >
      <cw-text-editor
        v-if="noModal"
        ref="input"
        :value="inputValue"
        class="base-input-editor__editor"
        :class="[inputClass]"
        v-bind="attrs"
        v-on="inputListeners"
      />

      <base-modal
        v-else
        ref="modal"
        :title="label || 'Text editor'"
        class="base-input-editor__modal"
        @done="editorDone"
      >
        <template #activator>
          <input
            v-if="!inputValue"
            readonly
            :value="inputValue"
            :class="[inputClass]"
            v-bind="attrs"
            v-on="inputListeners"
          >

          <cw-editor-text-viewer
            v-else
            tabindex="0"
            :value="inputValue"
            :dynamic-entities="dynamicEntities"
            @focus.native="inputListeners.focus"
            @blur.native="inputListeners.blur"
          />
        </template>

        <cw-text-editor
          ref="input"
          v-model="tmpValue"
          :class="[inputClass]"
          class="base-input-editor__editor"
          autofocus
          v-bind="attrs"
          @blur="inputListeners.blur"
        />
      </base-modal>
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
    value: { type: String, default: '' },
    label: { type: String, default: '' },
    noModal: Boolean,
    dynamicEntities: { type: Object, default: () => null }
  },
  data () {
    return {
      tmpValue: this.value
    }
  },
  watch: {
    value (v) {
      this.tmpValue = v
    }
  },
  methods: {
    focus () {
      if (this.$refs.input) {
        this.$refs.input.focus()
      }
    },

    editorDone () {
      this.$emit('input', this.tmpValue)
      this.$refs.modal.hide()
    }
  }
}
</script>

<style lang="scss">
.base-input-editor {
  overflow: hidden;
  margin-bottom: 0;
  padding-bottom: 1rem;

  &__modal, &__editor {
    height: 100%;
  }
}
</style>
