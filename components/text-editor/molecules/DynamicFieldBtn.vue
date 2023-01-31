<template>
  <base-menu
    v-if="items.length"
    :items="items"
    boundary="cw-text-editor"
    show-on-focus
    class="inline-block"
    @item-click="insertField"
  >
    <template #activator>
      <default-btn v-bind="$attrs" menu />
    </template>

    <template #item-text="{ item }">
      <span class="px-2 py-1">
        {{ item.text }}
      </span>
    </template>
  </base-menu>

  <default-btn v-else-if="dynamic" ref="btn" v-bind="$attrs" @click="openPrompt">
    <div ref="promptContainer" class="absolute w-0 h-0">
      <base-confirm-popup
        ref="prompt"
        title="Add dynamic field"
        :actions="[{ text: 'Add', handler: onPromptDone, hideOnClick: false }]"
        overlay
        @click.native.stop
      >
        <base-form v-slot="{ rules }">
          <base-input-text
            ref="input"
            v-model="tmpKey"
            placeholder="Enter key"
            label="Key"
            :rules="[rules.required]"
            autofocus
            light
            class="max-w-full"
            style="width: 400px; height: 70px;"
          />
        </base-form>
      </base-confirm-popup>
    </div>
  </default-btn>
</template>

<script>
import DefaultBtn from './DefaultBtn'
export default {
  components: {
    DefaultBtn
  },
  inheritAttrs: false,
  props: {
    command: { type: Function, default: null },
    editor: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      tmpKey: ''
    }
  },
  computed: {
    items () {
      // [{ text: '', value: '' }]
      return this.editor.extensions.options.dynamic_field.fields || []
    },
    dynamic () {
      return this.editor.extensions.options.dynamic_field.dynamic
    }
  },
  methods: {
    insertField (field) {
      this.command({ text: field.text, value: field.value })
    },

    openPrompt () {
      this.tmpKey = ''
      document.body.appendChild(this.$refs.promptContainer)
      this.$refs.prompt.show()
    },

    async onPromptDone () {
      if (await this.$refs.input.validate()) {
        this.insertField({ text: this.tmpKey, value: this.tmpKey })
        this.$refs.prompt.hide()
        this.$refs.btn.$el.appendChild(this.$refs.promptContainer)
      }
    }
  }
}
</script>
