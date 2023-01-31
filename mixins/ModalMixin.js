export default {
  data () {
    return {
      isModalShown: false
    }
  },
  methods: {
    closeModal () {
      this.isModalShown = false

      if (this.onCloseModal) {
        this.onCloseModal()
      }

      this.$emit('close')
    },

    showModal () {
      this.isModalShown = true

      if (this.onShowModal) {
        this.onShowModal()
      }
    }
  }
}
