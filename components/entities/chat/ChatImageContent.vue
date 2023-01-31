<template functional>
  <button
    class="w-full text-center focus:outline-none"
    :class="[data.class, data.staticClass]"
    :style="[data.style, data.staticStyle]"
    v-on="listeners"
  >
    <img :src="`/api/files/file/${props.source.content.imageId}/${props.source.content.filename}?size=sm`">
  </button>
</template>

<script>
export default {
  props: {
    source: { type: Object, required: true }
  }
}
</script>
