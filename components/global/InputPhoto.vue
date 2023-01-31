<template>
  <base-input-wrapper
    ref="wrapper"
    :value="tmpValue"
    :label="label"
    v-bind="$attrs"
    naked
    no-validate-on-blur
    class="base-input-photo"
    :class="{ 'base-input-photo--mobile': $mq === 'mobile' }"
    v-on="$listeners"
    @clear="setValue(null)"
  >
    <template v-if="label" #before>
      <label class="base-input-photo__label">{{ label }}</label>
    </template>

    <template #default="{ inputAttrs, inputListeners, inputClass }">
      <div
        class="base-input-photo__body"
        :class="[inputClass]"
        v-on="inputListeners"
      >
        <base-photo-uploader
          ref="uploader"
          :value="tmpValue"
          :disabled="inputAttrs.disabled || inputAttrs.readonly"
          :no-crop="noCrop"
          :lg="$mq !== 'mobile'"
          :style="{
            width: imageWidth ? +imageWidth + 'px' : '',
            height: imageHeight ? imageHeight + 'px' : '',
            borderRadius: imageRounded ? '' : '6px',
          }"
          class="base-input-photo__uploader"
          @input="setValue"
          @change="onFileChange"
        />

        <slot name="internal">
          <base-button
            ref="input"
            v-auto-resize-text
            class="base-input-photo__btn"
            :disabled="inputAttrs.disabled || inputAttrs.readonly"
            @click="$refs.uploader.inputFile()"
            v-on="$utils.extract(inputListeners, ['focus', 'blur'])"
          >
            {{ buttonText }}
          </base-button>
        </slot>
      </div>
    </template>

    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-wrapper>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: { type: String, default: '' },

    label: { type: String, default: null },

    buttonText: { type: String, default: 'Upload photo' },

    // Maximum file size in Mb
    max: { type: Number, default: 10 },

    // Example: 2560x1440
    requiredResolution: { type: String, default: null },

    quality: { type: String, default: '0.7' },

    noCrop: Boolean,

    imageRounded: Boolean,

    imageWidth: { type: [String, Number], default: null },

    imageHeight: { type: [String, Number], default: null }
  },
  data () {
    return {
      tmpValue: this.value
    }
  },
  watch: {
    value (v) {
      this.tmpValue = v
    }
  },
  methods: {
    focus () {
      if (this.$refs.input) {
        this.$refs.input.$el.focus()
      }
    },

    setValue (v) {
      if (!v && this.tmpValue) {
        this.$emit('change', { file: null, src: null })
      }

      this.tmpValue = v
      this.$emit('input', v)
    },

    async onFileChange ({ file, src } = {}) {
      if (
        file &&
        src &&
        (await this.validateFileSize(file)) &&
        (await this.validateResolution(src))
      ) {
        this.$emit('change', { file, src })
        return true
      } else {
        this.setValue(null)
        return false
      }
    },

    validateFileSize (file) {
      return this.$refs.wrapper.validate({
        size: () => {
          if (file.size > this.max * 1024 * 1024) {
            return this.$t('input.photo.rule.max_size', { max: this.max })
          }

          return true
        }
      })
    },

    validateResolution (dataURL) {
      if (this.requiredResolution && this.requiredResolution.length === 2) {
        const msg = this.$t('input.photo.rule.resolution', {
          resolution: this.requiredResolution
        })
        return this.$refs.wrapper.validate({
          resolution: () =>
            new Promise((resolve, reject) => {
              const [w, h] = this.requiredResolution
                .split('x')
                .map(n => parseInt(n))

              const img = new Image()

              img.onload = () => {
                if (w !== img.naturalWidth || h !== img.naturalHeight) {
                  resolve(msg)
                }

                resolve(true)
              }

              img.onerror = () => resolve(msg)

              img.src = dataURL
            })
        })
      }

      return true
    }
  }
}
</script>

<style lang="scss">
.base-input-photo {
  max-width: 100%;
  padding-bottom: 10px;

  &--mobile {
    .base-input-photo {
      &__uploader {
        margin-right: 16px;
      }

      &__btn {
        font-size: 12px;
      }
    }
  }

  &__label {
    grid-column: 1 / span 2;
    display: block;
    margin-bottom: 5px;
    font-size: 20px;
    cursor: default;
  }

  &__body {
    display: flex;
    align-items: center;
  }

  &__uploader {
    flex-shrink: 0;
    margin-right: 10%;
  }

  &__btn {
    min-width: 100px;
    @apply text-black w-auto rounded-6px;
  }
}
</style>
