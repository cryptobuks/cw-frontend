<template>
  <base-select
    v-bind="{
      ...$attrs,
      listeners: {
        ...$attrs.listeners,
        blur: () => onBlur($attrs.listeners)
      }
    }"
    :value="sportInterests.length ? $attrs.value : []"
    :items="sportInterests"
    item-text="name"
    item-value="_id"
    hide-selected
    v-on="{
      ...$listeners,
      blur: () => onBlur($listeners)
    }"
    @no-exact-match-click="suggestInterest"
  >
    <template v-if="allowSuggestion" #no-exact-match="{ searchText }">
      <div class="px-4 py-1">
        Suggest new sport interest "{{ searchText }}"
      </div>
    </template>
  </base-select>
</template>

<script>
import { mapState, mapActions } from 'vuex'
let debounce = null
export default {
  inheritAttrs: false,
  props: {
    allowSuggestion: Boolean
  },
  computed: {
    ...mapState('settings', ['sportInterests'])
  },
  watch: {
    '$attrs.value' (v) {
      if (!v) {
        this.$emit('input', [])
      }
    }
  },
  created () {
    if (!debounce) {
      debounce = this.$utils.createDebounce()
    }
    if (!this.sportInterests.length) {
      debounce(() => this.getSportInterests(), 50)
    }
  },
  methods: {
    ...mapActions('settings', ['getSportInterests']),

    onBlur (listeners) {
      listeners?.blur?.()
    },

    suggestInterest (interest) {
      const name = interest?.trim()
      name && this.$attrs.value.push({ isNew: true, danger: true, name })
    }
  }
}
</script>
