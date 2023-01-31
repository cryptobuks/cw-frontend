<template>
  <div ref="container" class="base-qrcode text-center" v-on="$listeners">
    <img v-if="src" :src="src" class="max-w-full max-h-full mx-auto p-4 bg-white">
  </div>
</template>

<script>
import { AwesomeQR, QRErrorCorrectLevel } from 'awesome-qr'
export default {
  props: {
    text: { type: String, default: '' },
    // base64 string
    logo: { type: String, default: null },
    // https://...jpg
    logoUrl: { type: String, default: null }
  },
  data () {
    return {
      src: null
    }
  },
  watch: {
    value: 'generate'
  },
  mounted () {
    this.generate()
  },
  methods: {
    async generate () {
      if (!this.$el) {
        return
      }

      if (!this.text) {
        this.src = null
        return
      }

      const { clientHeight, clientWidth } = this.$refs.container
      const size = Math.min(clientHeight || 100, clientWidth)
      const logo = this.logo || await this.fetchLogo()
      const logoScale = 0.25
      const logoMargin = 8

      // https://github.com/SumiMakito/Awesome-qr.js#logoimage
      // eslint-disable-next-line no-new
      new AwesomeQR({
        text: this.text,
        dotScale: 1,
        correctLevel: QRErrorCorrectLevel.H,
        colorDark: '#262626',
        autoColor: false,
        margin: 0,
        size,
        logoImage: logo || null,
        logoScale,
        logoCornerRadius: size * logoScale / 2 + logoMargin
      })
        .draw()
        .then((dataURL) => {
          this.src = dataURL
        })
    },

    fetchLogo () {
      return this.logoUrl && fetch(this.logoUrl)
        .then(res => res.blob())
        .then(blob => this.$utils.readFile(blob, 'base64'))
        .catch(() => {})
    }
  }
}
</script>
