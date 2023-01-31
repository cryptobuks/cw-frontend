<template>
  <base-input-text
    v-bind="$attrs"
    mask-placeholder="hh:mm"
    :mask="mask"
    :clearable="true"
    v-on="$listeners"
    @blur="correctTime"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  data () {
    return {
      mask: (value) => {
        const [h, m] = (value || '').split(':')
        const mask = !value
          ? [/[0-9]/]
          : h.length === 1 && (h > 2 || m === '')
            ? ['0', /[0-9]/, ':']
            : [/[0-2]/, h[0] === 2 ? /[0-3]/ : /[0-9]/]

        if (value.length > 2) {
          mask.push(':')

          if (!m) {
            mask.push(/[0-9]/)
          } else if (m.length === 1 && m > 5) {
            mask.push('0', /[0-9]/)
          } else {
            mask.push(/[0-5]/, /[0-9]/)
          }
        }

        return mask
      }
    }
  },
  watch: {
    '$attrs.value': {
      immediate: true,
      handler () {
        if (!document.activeElement || !this.$el?.contains?.(document.activeElement)) {
          this.correctTime()
        }
      }
    }
  },
  methods: {
    correctTime () {
      const value = this.$attrs.value
      if (value) {
        const [h, m] = (value + '').split(':').map(v => v.trim())
        const correctValue = h.padStart(2, '0') + ':' + (m || '').padStart(2, '0')
        if (value !== correctValue) {
          this.$emit('input', correctValue)
        }
      }
    }
  }
}
</script>
