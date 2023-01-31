<template>
  <div @focusin="$attrs.listeners.focus">
    <div class="flex items-center">
      <span>
        {{ $t('calendar.lesson_modal.period.label') }}
      </span>
      <base-icon
        v-tippy="{
          content: $attrs.tooltip,
          placement: 'bottom',
        }
        "
        class="ml-2"
        name="question-circle"
        size="20"
      />
    </div>
    <div class="flex justify-between mt-4">
      <div class="w-40">
        <base-input-date :value="start" :label="$attrs.startLabel" :placeholder="$attrs.startPlaceholder" @input="onStartChange($event, $attrs.listeners.validated, $attrs.listeners.error)" />
      </div>
      <div>
        <div class="flex justify-between">
          <base-checkbox type="radio" :checked="endType === 'end-by'" class="flex-shrink-0" :label="`${$attrs.endByRadioLabel}:`" @change="$emit('update:endType', 'end-by')" />
          <div class="ml-4 w-40">
            <base-input-date :value="end" :label="$attrs.endByInputLabel" :placeholder="$attrs.endByInputPlaceholder" @input="onEndChange($event, $attrs.listeners.validated, $attrs.listeners.error)" />
          </div>
        </div>
        <div class="flex justify-between">
          <base-checkbox type="radio" :checked="endType === 'end-after'" class="flex-shrink-0" :label="`${$attrs.endAfterRadioLabel}:`" @change="$emit('update:endType', 'end-after')" />
          <div class="ml-4 w-40">
            <base-input-text
              type="number"
              :value="endAfter"
              min="0"
              :label="$attrs.endAfterInputLabel"
              :placeholder="$attrs.endAfterInputPlaceholder"
              @change="onEndAfterChange(parseInt($event.target.value) || null, $attrs.listeners.validated, $attrs.listeners.error)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    start: Date,
    end: Date,
    endAfter: { type: Number, default: null },
    endType: { type: String, default: 'end-by' }
  },
  computed: {
    isValid () {
      return !!(this.start && ((this.endType === 'end-by' && this.end && this.start < this.end) || this.endAfter))
    }
  },
  methods: {
    onStartChange (value, validated, error) {
      this.$emit('update:start', value)

      this.$nextTick(() => {
        if (this.isValid) {
          validated?.()
          this.$emit('validated')
        } else {
          error?.()
        }
      })
    },
    onEndChange (value, validated, error) {
      this.$emit('update:end', value)

      this.$nextTick(() => {
        if (this.isValid) {
          validated?.()
          this.$emit('validated')
        } else {
          error?.()
        }
      })
    },
    onEndAfterChange (value, validated, error) {
      this.$emit('update:endAfter', value)

      this.$nextTick(() => {
        if (this.isValid) {
          validated?.()
          this.$emit('validated')
        } else {
          error?.()
        }
      })
    }
  }
}
</script>
