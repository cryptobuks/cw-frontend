<template>
  <base-modal
    ref="modal"
    :title="$t('barcode_modal.title')"
    @shown="init"
    @hidden="destroy"
  >
    <template v-if="$slots.activator" #activator>
      <slot name="activator" />
    </template>

    <div ref="camera">
      <video />
      <canvas />
    </div>

    <div v-if="error" class="text-center">
      {{ error }}
    </div>
  </base-modal>
</template>

<script>
import Quagga from 'quagga'
export default {
  data () {
    return {
      mounted: false,
      error: null
    }
  },
  methods: {
    show () {
      this.$refs.modal.show()
    },

    destroy () {
      if (this.mounted) {
        Quagga.offDetected(this.onDetected)
        Quagga.offProcessed(this.onProcessed)
        Quagga.stop()

        this.mounted = this.error = false
      }
    },

    init () {
      setTimeout(() => {
        if (!this.mounted) {
          this.mounted = true

          const opts = {
            inputStream: {
              type: 'LiveStream',
              constraints: {
                width: 640,
                height: 480,
                facingMode: 'environment',
                aspectRatio: { min: 1, max: 2 }
              },
              target: this.$refs.camera
            },
            locator: {
              patchSize: 'medium',
              halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
              readers: ['code_128_reader']
            },
            locate: true
          }

          Quagga.init(opts, (err) => {
            if (err) {
              this.error = err
            }
            Quagga.start()
          })
          Quagga.onDetected(this.onDetected)
          Quagga.onProcessed(this.onProcessed)
        }
      }, 1000)
    },

    onDetected (data) {
      const code = data?.codeResult?.code
      code && this.$emit('detected', code)
    },

    onProcessed (result) {
      const drawingCtx = Quagga.canvas.ctx.overlay
      const drawingCanvas = Quagga.canvas.dom.overlay
      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas.getAttribute('width')),
            parseInt(drawingCanvas.getAttribute('height'))
          )
          result.boxes
            .filter(function (box) {
              return box !== result.box
            })
            .forEach(function (box) {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                color: 'green',
                lineWidth: 2
              })
            })
        }
        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: '#00F',
            lineWidth: 2
          })
        }
        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(
            result.line,
            { x: 'x', y: 'y' },
            drawingCtx,
            { color: 'red', lineWidth: 3 }
          )
        }
      }
    }
  }
}
</script>
