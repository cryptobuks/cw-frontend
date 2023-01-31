<template>
  <div class="py-4">
    <!-- LABEL -->
    <div
      class="flex items-center text-xl focus:opacity-100"
      :class="{
        'opacity-50': (inactive || !items.length) && !active,
        'cursor-pointer': !!$listeners['add-item'],
        'cursor-default': !$listeners['add-item']
      }"
      v-bind="$attrs"
      :tabindex="$attrs.tabindex || 0"
      @click="$emit('add-item')"
      @keyup.enter.stop="$emit('add-item')"
    >
      <label class="mr-5 uppercase cursor-inherit">
        <slot name="label">{{ label }}</slot>
      </label>

      <base-icon v-if="tooltip" v-tippy="patchedTooltip" name="question-circle" />

      <span class="ml-auto w-0 inline-block" />

      <slot name="affix">
        {{ affix }}
      </slot>

      <base-icon v-if="$listeners['add-item']" name="chevron-right" class="ml-2" />

      <base-icon
        v-if="mergedListeners.skip"
        name="skip"
        class="ml-2"
        @click.native.stop="mergedListeners.skip"
      />
    </div>

    <slot />

    <base-validation-error
      ref="error"
      :value="items"
      :rules="rules"
      :hidden-rules="hiddenRules"
      :hide-error="hideError"
      class="text-center leading-none"
      v-on="errorListeners"
    />

    <!-- BANKS LIST -->
    <template v-for="(item, i) in items">
      <div :key="i" class="mt-4" :class="[itemClass]">
        <slot name="item" :item="item" :index="i" />
      </div>

      <base-validation-error
        :key="i + '_error'"
        :value="item"
        :validated-value="validatedValue"
        :rules="patchItemRules(item)"
        :hide-error="hideError"
        class="text-center leading-none"
        v-on="errorListeners"
      >
        <template v-for="name in filterErrorSlots($scopedSlots)" v-slot:[name]="props">
          <slot :name="name" v-bind="props" />
        </template>
      </base-validation-error>
    </template>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    items: { type: Array, default: () => [] },
    itemClass: { type: String, default: '' },

    // Mimic InputWrapper
    label: { type: String, default: null },
    tooltip: { type: [String, Function], default: null },
    affix: { type: String, default: '' },
    active: Boolean,
    inactive: Boolean,
    rules: { type: [Array, Object], default: () => ({}) },
    // eslint-disable-next-line vue/require-prop-types
    validatedValue: { default: undefined },
    hiddenRules: { type: [Array, Object], default: () => ({}) },
    itemRules: { type: [Array, Object], default: () => ({}) },
    hideError: Boolean,
    listeners: { type: Object, default: () => ({}) }
  },
  computed: {
    mergedListeners () {
      const listeners = { ...this.$listeners }
      for (const key of Object.keys(this.listeners)) {
        if (typeof this.listeners[key] !== 'function') {
          continue
        }

        listeners[key] = !listeners[key] ? this.listeners[key] : (...params) => {
          this.$listeners[key](...params)
          this.listeners[key](...params)
        }
      }

      return listeners
    },

    patchedTooltip () {
      return typeof this.tooltip === 'function'
        ? this.tooltip(this)
        : this.tooltip
    },

    errorListeners () {
      const output = this.$utils.extract(this.mergedListeners, [{ from: 'validation-reset', to: 'reset' }, 'error', 'validated'])
      for (const key of Object.keys(this.mergedListeners)) {
        if (key.startsWith('error:')) {
          output[key] = this.mergedListeners[key]
        }
      }
      return output
    }
  },
  methods: {
    filterErrorSlots (slots) {
      return Object.keys(slots).filter(s => s.startsWith('error'))
    },

    patchItemRules (item) {
      const output = {}
      for (const ruleName of Object.keys(this.itemRules)) {
        output[ruleName] = () => this.itemRules[ruleName](item)
      }
      return output
    },

    validate (...params) {
      return this.$refs.error.validate(...params)
    }
  }
}
</script>
