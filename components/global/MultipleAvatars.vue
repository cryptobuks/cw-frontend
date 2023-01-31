<template>
  <div
    class="flex items-center cursor-pointer"
    @click="$emit('more', avatarData.more)"
    v-on="$listeners"
  >
    <img
      v-for="(image, index) in avatarData.avatars"
      :key="`${componentId}-${index}`"
      :src="image"
      alt="personnel image"
      class="rounded-full"
      :class="[index > 0 ? avatarData.marginClass : '', avatarData.sizeClass]"
    >
    <slot name="more" v-bind="avatarData">
      <button
        v-if="avatarData.more > 0 && !hideMore"
        class="ml-3 flex items-center justify-center rounded-full bg-gray-600 text-white font-bold focus:outline-none text-xs"
        :class="[avatarData.sizeClass]"
      >
        {{ avatars.length }}
      </button>
    </slot>
  </div>
</template>

<script>
export default {
  props: {
    avatars: { type: Array, required: true },
    count: { type: Number, default: 4 },
    hideMore: Boolean,
    size: { type: String, default: 'md' },
    spaceBetween: { type: String, default: null }
  },
  data: () => ({
    componentId: null
  }),
  computed: {
    avatarData () {
      const avatars = this.avatars.slice(0, this.count)
      const more = this.avatars.length - this.count
      const sizeClass = { md: 'h-10 w-10', sm: 'h-8 w-8', xs: 'h-6 w-6' }[
        this.size
      ]
      const marginClass =
        this.spaceBetween ||
        { md: '-ml-5', sm: '-ml-4', xs: '-ml-3' }[this.size]

      return { avatars, more, sizeClass, marginClass }
    }
  },
  created () {
    this.componentId = this._uid
  }
}
</script>

<style></style>
