<template>
  <base-multiple-inputs-wrapper
    :value="value"
    :new-item="() => null"
    :max="codiceAtecoSuggestions.length"
    @input="$emit('input', $event)"
  >
    <template #item="{ index }">
      <base-select
        v-model="value[index]"
        v-bind="$attrs"
        :items="codiceAtecoSuggestions"
        :item-text="(item) => item._id + ' - ' + item.desc"
        item-value="_id"
        :hidden-items="value"
      />
    </template>
  </base-multiple-inputs-wrapper>
</template>

<script>
import { mapState } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] }
  },
  computed: mapState('profile', ['codiceAtecoSuggestions']),
  created () {
    this.$store.dispatch('profile/getCodiceAtecoSuggestions')
  }
}
</script>
