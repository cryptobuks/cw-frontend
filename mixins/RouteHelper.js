export default {
  methods: {
    isCurrentPath (path) {
      const currentPath = this.$route.path.replace(/\/$/, '') || '/'
      return currentPath === path
    },

    isParentPath (path) {
      return this.$route.path.indexOf(path) === 0 && !this.isCurrentPath(path)
    },

    isInPath (path) {
      return this.$route.path.indexOf(path) === 0
    }
  }
}
