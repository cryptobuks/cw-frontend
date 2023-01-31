export default {
  computed: {
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    }
  }
}
