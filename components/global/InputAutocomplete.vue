<template>
  <base-input-wrapper
    class="base-autocomplete"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #default="{ inputAttrs, inputListeners, inputClass }">
      <base-menu
        ref="popover"
        :items="items"
        :disabled="inputAttrs.readonly || inputAttrs.disabled"
        show-on-focus
        class="flex"
        @item-click="selectItem($event, inputListeners.input)"
      >
        <template #activator>
          <template v-if="textarea">
            <textarea
              ref="input"
              :class="[inputClass]"
              v-bind="inputAttrs"
              rows="1"
              v-on="patchListener(inputListeners)"
              @input="onInput($event.target.value)"
            />
          </template>

          <template v-else>
            <input
              v-if="inputAttrs.autocomplete && inputAttrs.autocomplete.includes('off')"
              :autocomplete="inputAttrs.autocomplete"
              :name="inputAttrs.name"
              :type="inputAttrs.type"
              :placeholder="inputAttrs.placeholder"
              class="hidden"
            >

            <input
              ref="input"
              v-auto-resize-text
              :class="[inputClass]"
              v-bind="inputAttrs"
              rows="1"
              v-on="patchListener(inputListeners)"
              @input="onInput($event.target.value)"
              @keyup.esc.stop
            >
          </template>
        </template>

        <template v-if="$scopedSlots.item" #item="props">
          <slot name="item" v-bind="props" />
        </template>

        <template #item-text="props">
          <slot name="item-text" v-bind="props">
            <span class="px-2 py-1">
              {{ getItemText(props.item) }}
            </span>
          </slot>
        </template>
      </base-menu>
    </template>

    <!-- Pass all $scopedSlots to base-input-wrapper -->
    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    // Available options
    items: { type: Array, default: () => [] },

    // If an item is {text: 'Option1', value: '1'} itemText should be "text"
    itemText: { type: [String, Function], default: 'text' },

    // For an async search operation, debounce is recommended to be used to
    // reduce the number of network requests
    debounceDuration: { type: Number, default: 0 },

    textarea: Boolean
  },
  data () {
    return {
      debounce: this.$utils.createDebounce()
    }
  },
  methods: {
    focus () {
      if (this.$refs.input) {
        this.$refs.input.focus()
      }
    },

    getItemText (item) {
      return typeof this.itemText === 'function'
        ? this.itemText(item)
        : !this._isObject(item)
          ? item ?? ''
          : (item && item[this.itemText]) ?? item
    },

    selectItem (item, setValue) {
      this.$emit('item-select', item)
      setValue && setValue(this.getItemText(item))
    },

    onInput (value) {
      this.debounce(() => this.$emit('search', (value || '').trim().toLowerCase()), this.debounceDuration)
    },

    _isObject (v) {
      return Object.prototype.toString.call(v) === '[object Object]'
    },

    patchListener (listeners) {
      if (!listeners.blur) {
        return listeners
      }
      const { blur, ...output } = listeners
      // wait for case select-item listener to complete
      output.blur = e => setTimeout(() => blur(e), 300)
      return output
    }
  }
}
</script>
