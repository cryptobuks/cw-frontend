<template functional>
  <span
    class="base-spinner"
    :class="[props.light ? 'base-spinner--light' : '', data.staticClass || '', data.class || '']"
  >
    Loading...
  </span>
</template>

<script>
export default {
  props: {
    light: Boolean
  }
}
</script>

<style lang="scss">
.base-spinner {
  text-indent: -9999em;
  position: relative;
  top: 0.15em;
  font-size: inherit;
  transform: translateZ(0);
  animation-delay: -0.16s;

  @apply text-gray-750 bg-gray-750;

  &, &:before, &:after {
    animation-name: spinner-load;
    animation-duration: 1s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    width: 0.25em;
    height: 1em;
  }

  &:before, &:after {
    content: '';
    position: absolute;
    top: 0;
    background: inherit;
  }

  &:before {
    left: -0.375em;
    animation-delay: -0.32s;
  }

  &:after {
    left: 0.375em;
  }

  &--light {
    color: #fff;

    &, &:before, &:after {
      background: #fff;
    }
  }
}

@keyframes spinner-load {
  0%,
  80%,
  100% {
    box-shadow: 0 0;
    height: 1em;
  }
  40% {
    box-shadow: 0 -0.5em;
    height: 1.25em;
  }
}
</style>
