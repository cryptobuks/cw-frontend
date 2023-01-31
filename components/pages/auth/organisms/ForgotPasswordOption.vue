<template>
  <div class="forgot-pw__option">
    <base-checkbox
      :checked="value === name"
      type="radio"
      :value="name"
      :label="label"
      light
      @change="$emit('input', name)"
    />

    <div v-if="value === name" class="forgot-pw__option__body">
      <slot />

      <p class="forgot-pw__option__description" :class="{ 'is-error': hasError }">
        {{ hasError ? errorMessage : description }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: { type: String, default: '' },
    name: { type: String, default: '' },
    label: { type: String, default: '' },
    description: { type: String, default: '' },
    errorMessage: { type: String, default: '' },
    hasError: Boolean
  }
}
</script>

<style lang="scss">
.forgot-pw__option {
  @apply bg-white text-black overflow-hidden rounded-10px p-4 mb-5;

  &__body {
    padding-top: 15px;
  }

  &__description {
    text-align: center;

    &.is-error {
      @apply text-cw-red;
    }
  }
}
</style>
