<template functional>
  <a class="preview-wrapper" :href="props.preview.url" target="_blank">
    <img
      v-if="props.preview.image"
      class="image"
      :src="`data:image/jpeg;base64,${props.preview.image}`"
    >
    <div class="preview-content">
      <span v-if="props.preview.meta.title" class="font-semibold truncate text-sm">{{ props.preview.meta.title }}</span>
      <p v-if="props.preview.meta.description" class="text-black text-opacity-50 text-xs truncate">
        {{ props.preview.meta.description }}
      </p>
      <span class="text-xs text-black text-opacity-60 truncate">{{ props.preview.url }}</span>
    </div>
  </a>
</template>

<script>
export default {
  props: {
    preview: { type: Object, required: true }
  }
}
</script>

<style lang="scss" scoped>
.preview-wrapper {
  backdrop-filter: hue-rotate(45deg);
  overflow: hidden;
  flex: 0 0 auto;
  content-visibility: auto;
  contain-intrinsic-size: 90px;
  @apply flex flex-col items-center rounded-lg bg-black bg-opacity-20;

  .image {
    flex: 0 0 auto;
    height: 90px;
    max-height: 100%;
    @apply flex flex-col bg-cover bg-center bg-no-repeat;
  }

  .preview-content {
    max-height: 90px;
    line-height: 19px;
    @apply flex flex-col justify-center w-full overflow-hidden py-1 px-3;
  }

  @screen lg {
    @apply flex-row;
  }
}
</style>
