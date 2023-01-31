<template>
  <nav class="cw-navbar" :class="{ 'cw-navbar--bottom': bottom }">
    <cw-navbar-item
      v-for="item in items"
      :key="item.label"
      :active="activeItem === item"
      v-bind="item"
      :small="bottom"
      @click.native="item.click && item.click($event)"
    />

    <slot :active-item="activeItem" />
  </nav>
</template>

<script>
import RouteHelper from '~/mixins/RouteHelper'
export default {
  name: 'CwNavbar',
  mixins: [RouteHelper],
  props: {
    items: { type: Array, required: true },
    bottom: Boolean
  },
  computed: {
    activeItem () {
      return this.items.find((item) => {
        return (item.to && this.$route.path.startsWith(item.to)) ||
          (item.activePaths && item.activePaths.some(p => this.$route.path.startsWith(p)))
      })
    }
  }
}
</script>

<style lang="scss">
.cw-navbar {
  padding: 20px;
  box-shadow: 0 2px 6px 0 rgba(33, 33, 33, 0.5);
  background-color: #fff;
  opacity: .95;
  display: flex;
  height: 80px;
  position: relative;
  z-index: 100;

  &--bottom {
    height: 49px;
    padding: 0;
    box-shadow: none;
    @apply bg-black;
  }
}
</style>
