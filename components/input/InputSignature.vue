<template>
  <cw-input-subflow-wrapper ref="wrapper" v-bind="$attrs">
    <div
      class="relative input-signature__pad"
      :tabindex="$attrs.tabindex || 0"
      @focus="onFocus"
      @blur="onBlur"
    >
      <div
        v-if="pad"
        class="flex flex-col absolute top-0 right-0 pointer-events-none text-gray-600 text-sm"
      >
        <span
          v-for="action in actions"
          :key="action.icon"
          class="w-5 h-5 inline-flex justify-center items-center cursor-pointer mb-2 pointer-events-auto"
          @click="action.handler"
        >
          <base-icon :name="action.icon" />
        </span>
      </div>

      <canvas ref="canvas" />
    </div>
  </cw-input-subflow-wrapper>
</template>

<script>
import SignaturePad from 'signature_pad'
export default {
  inheritAttrs: false,
  props: {
    value: { type: String, default: '' }
  },
  data () {
    return {
      pad: null,
      draft: null,
      actions: [
        { icon: 'dismiss', handler: () => this.clear() }
      ],
      hideError: false
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        if (!this.pad || v === this.draft) {
          return
        }

        this.draft = v
        if (v) {
          this.pad.fromDataURL(v)
        } else {
          this.pad.clear()
        }
      }
    }
  },
  async mounted () {
    await new Promise((resolve, reject) => setTimeout(resolve, 500))

    const canvas = this.$refs.canvas
    canvas.setAttribute('width', this.$el.clientWidth)

    this.pad = new SignaturePad(canvas, {
      backgroundColor: '#fff',
      onEnd: () => {
        this.draft = this.pad.isEmpty() ? null : this.pad.toDataURL('image/svg+xml')
        this.$emit('input', this.draft)
      }
    })

    if (this.value) {
      this.pad.fromDataURL(this.value)
    }
  },
  methods: {
    clear () {
      this.pad?.clear?.()
      this.draft = null
      this.$emit('input', this.draft)
    },

    onFocus () {
      this.trigger('focus')
      this.hideError = true
    },

    onBlur () {
      this.$refs.wrapper.validate()
      this.trigger('blur')
      this.hideError = false
    },

    trigger (event, e) {
      this.$emit(event, e)
      this.$attrs.listeners?.[event]?.(e)
    }
  }
}
</script>
