<template>
  <base-popover class="" :offset-x="20" :offset-y="20" keep-alive>
    <template #activator="{ active }">
      <div class="flex items-center justify-between min-w-15 cursor-pointer">
        <slot name="display" v-bind="{ data }">
          <span class="text-xs">
            {{ getKey(data, display || itemText || outputKey) }}
          </span>
        </slot>
        <base-icon
          name="chevron-down"
          size="10"
          :rotate="active ? -180 : 0"
          class="ml-1"
        />
      </div>
    </template>

    <template #default="{ hide: hidePopover }">
      <div
        class="flex flex-col w-40 shadow-cw-card bg-white -ml-4 -mt-4 rounded-lg px-3"
        @click="hidePopover"
      >
        <div
          v-for="item in items"
          :key="`items-${getKey(item, inputKey)}`"
          @click="selectItem(item)"
        >
          <slot name="itemText">
            <div class="flex items-center justify-between py-1 cursor-pointer">
              <span class="text-sm">{{ getKey(item, itemText) }}</span>
              <base-input-check
                v-if="dataType === 'array'"
                v-bind="{
                  disabled: false,
                  inputKey,
                  outputKey,
                  result: data,
                  size: 15,
                  value: item,
                }"
                @change="(val) => checked(item, val)"
              />
            </div>
          </slot>
        </div>
      </div>
    </template>
  </base-popover>
</template>

<script>
import _ from 'lodash'
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    display: { type: [String, Function], default: undefined },
    items: { type: Array, required: true },
    itemText: { type: [String, Function], default: undefined },
    inputKey: { type: [String, Function], default: undefined },
    outputKey: { type: [String, Function], default: undefined },
    value: { type: null, default: null }
  },
  data: () => ({
    data: null,
    dataType: 'string'
  }),
  watch: {
    data: {
      deep: true,
      handler (data) {
        if (_.isEqual(this.value, data)) { return }
        this.$emit('change', data)
      }
    },
    value: {
      immediate: true,
      deep: true,
      handler (value) {
        if (_.isEqual(value, this.data)) { return }
        if (_.isArray(value)) {
          this.dataType = 'array'
        } else {
          this.dataType = typeof value
        }

        this.data = _.cloneDeep(value)
      }
    }
  },
  methods: {
    checked (item, data) {
      // handle change manaually if @new is present
      if (this.$listeners && this.$listeners.new) { return this.$emit('new', item) }
      this.data = data
    },
    getKey (item, key) {
      const keyType = typeof key
      if (keyType === 'undefined') { return item }
      if (keyType === 'function') { return key(item) }
      if (keyType === 'string') { return item[key] }
    },
    selectItem (item) {
      if (this.dataType === 'array') { return }
      item = this.getKey(item, this.outputKey)
      this.data = item
    }
  }
}
</script>
