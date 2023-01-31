<template>
  <cw-input-subflow-wrapper
    v-bind="$attrs"
    :items="value"
    item-class="flex items-center -mx-3"
  >
    <template #item="{ item, index }">
      <div class="w-1/3 px-3 overflow-hidden">
        <base-input-text
          v-model.number="item.credit"
          type="number"
          min="0"
          max="999999"
          :label="$t('input.credits.credit.label')"
          v-on="listeners"
          @blur="onBlur"
        />
      </div>

      <div class="w-1/3 px-3">
        <base-input-date
          v-model="item.start"
          :max="item.end ? $dayjs(item.end).subtract(1, 'day').toDate() : null"
          :rules="[
            start => !start ||
              !item.end ||
              $dayjs(start).isBefore($dayjs(item.end))
          ]"
          :label="$t('input.credits.start.label')"
          hide-prepend
          input-class="max-w-36"
          v-on="listeners"
        />
      </div>

      <div class="w-1/3 px-3">
        <base-input-date
          v-model="item.end"
          :min="item.start ? $dayjs(item.start).add(1, 'day').toDate() : null"
          hide-prepend
          :label="$t('input.credits.end.label')"
          input-class="max-w-36"
          v-on="listeners"
        />
      </div>

      <div v-if="index === value.length - 1">
        <base-icon
          name="add"
          class="mb-4 cursor-pointer"
          @click="value.push({ credit: null, start: null, end: null })"
        />
      </div>
    </template>
  </cw-input-subflow-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] }
  },
  computed: {
    listeners () {
      return this.$utils.except(this.$attrs.listeners, ['input', 'skip'])
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (value) {
        if (!value?.length) {
          this.$emit('input', [{ credit: null, start: null, end: null }])
        }
      }
    }
  },
  methods: {
    onBlur () {
      setTimeout(() => {
        const [item] = this.value
        if (item?.credit) {
          this.$attrs.listeners?.validated()
        }
      }, 200)
    }
  }
}
</script>
