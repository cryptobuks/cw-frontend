<template>
  <base-input-wrapper
    v-bind="$attrs"
    :value="value"
    :type="shouldMergeAffix ? 'text' : type"
    :affix="shouldMergeAffix ? '' : affix"
    :maxlength="maxlength"
    class="base-input-text"
    v-on="$listeners"
  >
    <template #default="{ inputAttrs, inputListeners, inputClass }">
      <input
        v-if="
          inputAttrs.autocomplete && inputAttrs.autocomplete.includes('off')
        "
        v-mask="mask"
        :autocomplete="inputAttrs.autocomplete"
        :name="inputAttrs.name"
        :type="inputAttrs.type"
        :placeholder="inputAttrs.placeholder"
        class="hidden"
      >

      <input
        ref="input"
        v-auto-resize-text
        v-mask="mask"
        v-bind="inputAttrs"
        :value="shouldMergeAffix ? inputAttrs.value + ' ' + affix : inputAttrs.value"
        :class="[inputClass]"
        class="base-input-text__input"
        v-on="inputListeners"
        @focus="onFocus"
        @blur="onBlur"
      >

      <div
        v-if="mask && maskPlaceholder && (!inputAttrs.value || maskPlaceholder.length > inputAttrs.value.length)"
        class="base-input-text__placeholder"
      >
        <template v-if="inputAttrs.value">
          <i class="invisible">{{ inputAttrs.value }}</i>{{ maskPlaceholder.slice(inputAttrs.value.length) }}
        </template>

        <template v-else>
          {{ maskPlaceholder }}
        </template>
      </div>
    </template>

    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-wrapper>
</template>

<script>
export default {
  name: 'BaseInputText',
  inheritAttrs: false,
  props: {
    value: { type: [String, Number], default: '' },
    maskPlaceholder: { type: String, default: '' },
    maxlength: { type: [String, Number], default: '60' },
    mask: { type: null, default: null },
    type: { type: String, default: 'text' },
    affix: { type: String, default: '' }
  },
  data () {
    return {
      shouldMergeAffix: !!this.affix
    }
  },
  created () {
    this.onBlur()
  },
  methods: {
    focus () {
      this.$refs.input?.focus?.()
    },

    onFocus () {
      this.shouldMergeAffix = false
    },

    onBlur () {
      setTimeout(() => {
        this.shouldMergeAffix = this.type === 'number' &&
          !!this.affix &&
          !!this.value &&
          document.activeElement !== this.$refs.input
      }, 200)
    }
  }
}
</script>

<style lang="scss">
.base-input-text {
  &__input:focus + .base-input-text__placeholder {
    @apply flex;
  }

  &__placeholder {
    padding-left: 7px;
    @apply hidden pointer-events-none absolute left-0 bottom-0 opacity-50 h-full items-center;
  }
}
</style>
