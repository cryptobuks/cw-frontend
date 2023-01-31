<template>
  <div ref="container" class="base-printer">
    <slot />
  </div>
</template>

<script>
export default {
  methods: {
    print ({ title } = {}) {
      if (typeof window.print === 'function') {
        const documentTitle = document.title
        const $clonedContainer = this.$refs.container.cloneNode(true)
        document.body.appendChild($clonedContainer)
        document.title = title || documentTitle
        window.print()
        document.title = documentTitle
        document.body.removeChild($clonedContainer)
      }
    }
  }
}
</script>

<style lang="scss">
@media print {
  body {
    visibility: hidden;

    > .base-printer {
      visibility: visible;
      background: #fff;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100vw;
      min-height: 100vh;
      padding: 1rem 4rem;
      overflow: auto;
      box-shadow: none;
      z-index: 1000;
    }
  }
}
</style>
