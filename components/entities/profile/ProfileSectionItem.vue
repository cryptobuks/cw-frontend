<template>
  <div
    class="my-1 bg-white p-3 flex justify-between items-center cursor-pointer"
    v-on="$listeners"
  >
    <slot>
      <div class="flex items-center">
        <base-icon :name="icon" size="20" :replace="iconText && { text: iconText }" />
        <span class="text-sm ml-3 font-semibold capitalize">{{ $t(title) }}</span>
      </div>
      <div class="flex items-center">
        <slot name="right-content" />
        <base-icon
          v-if="!noNavigation"
          name="chevron-right"
          size="15"
          class="text-gray-500"
        />
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  props: {
    icon: { type: String, required: true },
    iconText: { type: [Number, String], default: null },
    title: { type: String, required: true },
    noNavigation: Boolean
  }
}
</script>

<style></style>
