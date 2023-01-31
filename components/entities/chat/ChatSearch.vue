<template>
  <div class="inline-flex justify-end items-center">
    <base-input-text
      type="search"
      class="search-field"
      :class="{ collapsed: !expanded }"
      prepend-icon="search"
      light
      naked
      :value="value"
      @input="$emit('input', $event)"
    />
    <div class="relative w-4 h-4 flex-shrink-0">
      <transition
        :enter-class="expanded ? 'opacity-0 transform -rotate-90' : 'opacity-0 transform rotate-90'"
        :leave-to-class="expanded ? 'opacity-0 transform rotate-90' : 'opacity-0 transform -rotate-90'"
        enter-active-class="transition-opacity transition-transform duration-300"
        leave-active-class="transition-opacity transition-transform duration-300"
      >
        <button v-if="expanded" key="close-btn" @click="expanded = false">
          <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M9.283 7.48L15 13.199V15h-1.782L7.5 9.268 1.783 15H0v-1.801L5.717 7.48 0 1.748V0h1.806L7.5 5.696 13.194 0H15v1.748z" fill-rule="evenodd" />
          </svg>
        </button>
        <button v-else key="magnifier" @click="expanded = true">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(1 1)" stroke="currentColor" stroke-width="2.5" fill="none" fill-rule="evenodd">
              <circle cx="12.153" cy="12.153" r="12.153" />
              <path d="M21.125 21.553l8.873 7.974" stroke-linecap="round" />
            </g>
          </svg>
        </button>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: { type: String, default: '' }
  },
  data: () => ({
    expanded: false
  })
}
</script>

<style scoped>
.search-field {
  transition: width 300ms, padding 300ms;
  @apply bg-white w-full h-full py-0 px-4 mb-0 mr-4 rounded-10px overflow-hidden;

  &.collapsed {
    @apply w-0 px-0;
  }
}

button {
  @apply text-gray-600 absolute w-full h-full;

  &:focus {
    @apply outline-none;
  }
}
</style>
