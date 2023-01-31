<template>
  <button class="flex justify-between items-center text-xs text-gray-750 pl-2 pr-4 py-2 focus:outline-none hover:bg-gray-200" @click="$emit('click')">
    <span class="flex items-center">
      <base-icon class="text-black stroke-current" :name="icon" size="20" />
      <span class="ml-4"><slot /></span>
    </span>
    <base-icon class="text-black text-opacity-50" name="chevron-right" />
  </button>
</template>

<script>
export default {
  props: {
    icon: { type: String, required: true }
  }
}
</script>
