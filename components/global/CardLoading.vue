<template>
  <div
    class="w-full h-full flex items-center justify-center bg-gray-150 bg-opacity-90"
    :class="[roundness]"
  >
    <base-spinner size="sm" />
  </div>
</template>

<script>
export default {
  props: { roundness: { type: String, default: '' } }
}
</script>
