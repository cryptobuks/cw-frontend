<template>
  <base-modal
    ref="modal"
    :title="$t('img_editor.modal_title')"
    content-class="base-img-editor__content"
    @done="done"
  >
    <template v-if="$scopedSlots.activator" #activator="props">
      <slot name="activator" v-bind="props" />
    </template>

    <div class="base-img-editor__body">
      <img v-if="src" ref="img" :src="src" @load="onImgLoaded">
    </div>
  </base-modal>
</template>

<script>
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'
export default {
  props: {
    // https://github.com/fengyuanchen/cropperjs/blob/master/README.md#options
    cropperOpts: { type: Object, default: () => ({}) },

    // https://github.com/fengyuanchen/cropperjs/blob/master/README.md#getcroppedcanvasoptions
    outputOpts: { type: Object, default: () => ({ width: 0, height: 0 }) }
  },
  data () {
    return {
      cropper: null,
      src: null,
      defaultCropperOpts: {
        aspectRatio: 1 / 1,
        minContainerWidth: 150,
        minCanvasWidth: 150,
        background: false
      }
    }
  },
  methods: {
    show (src, cropperOpts = {}) {
      this.src = src
      this.$refs.modal.show()
    },

    onImgLoaded () {
      const opts = Object.assign({}, this.defaultCropperOpts, this.cropperOpts)
      this.cropper = new Cropper(this.$refs.img, opts)
    },

    done () {
      const canvas = this.cropper.getCroppedCanvas(this.outputOpts)
      this.$emit('done', canvas)

      this.$refs.modal.hide()
    }
  }
}
</script>

<style lang="scss">
.base-img-editor {
  &__content {
    background: #000;
  }

  &__body {
    height: 100%;
    overflow: hidden;
    background: #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    > img {
      max-width: 100%;
      max-height: 100%;
    }

    .cropper-crop-box, .cropper-view-box {
      @apply rounded-1/2;
    }
  }
}
</style>
