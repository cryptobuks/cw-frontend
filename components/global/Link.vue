<template>
  <nuxt-link v-if="$attrs.to" v-bind="$attrs">
    <slot />
  </nuxt-link>

  <div v-else class="base-link">
    <slot />
  </div>
</template>

<script>
export default {
  inheritAttrs: false
}
</script>

<style lang="scss">
.base-link {
  cursor: pointer;
}
</style>
