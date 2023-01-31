export default {
  created () {
    document.addEventListener('keyup', (event) => {
      switch (event.keyCode) {
        case 27:
          if (this.escPress) {
            this.escPress()
          }
          break

        case 38:
          if (this.upKeyPress) {
            this.upKeyPress()
          }
          break

        case 40:
          if (this.downKeyPress) {
            this.downKeyPress()
          }
          break

        case 13:
          if (this.enterPress) {
            this.enterPress()
          }
          break
      }
    })
  }
}
