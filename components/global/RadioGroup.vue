<template>
  <div class="base-radio-group">
    <base-checkbox
      v-for="(item, i) in items"
      :key="item._id || i"
      v-bind="$attrs"
      :checked="checked === item[itemValue]"
      :value="item[itemValue]"
      :label="item[itemText]"
      type="radio"
      class="pb-3"
      :class="[itemClass]"
      v-on="$utils.except($listeners, 'change')"
      @change="$emit('change', item[itemValue])"
    />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: { type: [String, Number], default: '' },
    items: { type: Array, default: () => [] },
    itemText: { type: String, default: 'text' },
    itemValue: { type: String, default: 'value' },
    itemClass: { type: String, default: '' }
  }
}
</script>
