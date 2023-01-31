export default {
  methods: {
    initGoogleMap (callback) {
      const SCRIPT_ID = 'cw-gg-map'
      if (!document.querySelector('#' + SCRIPT_ID)) {
        window.mapApiInitialized = callback
        const script = document.createElement('script')
        script.setAttribute('id', SCRIPT_ID)
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.$config.googleMapAPIKey}&libraries=places&callback=mapApiInitialized`
        document.body.appendChild(script)
      } else {
        callback()

        // For multiple input address on the same page at the same time, the above callback() might be executed before the script takes place
        const oldMapApiInitialized = window.mapApiInitialized
        if (oldMapApiInitialized) {
          window.mapApiInitialized = () => {
            oldMapApiInitialized()
            callback()
          }
        }
      }
    }
  }
}
