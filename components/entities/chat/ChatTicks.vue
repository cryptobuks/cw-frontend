<template functional>
  <svg
    :class="[props.read ? 'ticks-read' : 'opacity-50' ]"
    width="26"
    height="15"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      stroke-linecap="round"
      stroke-width="1.5"
      fill="none"
      fill-rule="evenodd"
    >
      <path class="stroke-current" d="M1 8.507l5.463 5.267 13.5-12.85" />
      <path
        v-show="props.delivered || props.read"
        class="stroke-current"
        d="M 11.06,13.943 24.56,1.093"
      />
      <!-- d="M5.597 8.676l5.463 5.267 13.5-12.85" -->
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false }
  }
}
</script>

<style lang="postcss" scoped>
.ticks-read {
  @apply text-cw-red;
}
</style>
