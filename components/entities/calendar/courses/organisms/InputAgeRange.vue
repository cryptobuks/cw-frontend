<template>
  <div class="flex items-center py-4" @focusin="$attrs.listeners.focus">
    <base-icon
      v-tippy="{
        content: tooltip,
        placement: 'bottom',
      }
      "
      name="question-circle"
      size="20"
    />
    <span class="ml-2 uppercase">
      {{ $t('global.age') }}
    </span>
    <vue-slider
      :value="value"
      class="age-slider flex-1 ml-4"
      :marks="{ 0: '0', 100: '100+'}"
      tooltip="always"
      tooltip-placement="bottom"
      :enable-cross="false"
      @change="$emit('change', $event)"
    />
    <div
      v-if="$attrs.listeners && $attrs.listeners.skip"
      class="cursor-pointer ml-4"
      @click.stop="$attrs.listeners.skip"
    >
      <base-icon name="skip" size="20" />
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'

export default {
  components: {
    VueSlider
  },
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    tooltip: { type: [String, Function], default: '' },
    value: { type: Array, default: () => [] }
  }
}
</script>

<style lang="postcss" scoped>
.age-slider {
  & ::v-deep .vue-slider-rail {
    height: 2px;
  }

  & ::v-deep .vue-slider-process {
    top: -100% !important;
    height: 400% !important;
    background-color: #ffffff;
    border-top: 1px solid #86cf9e;
    border-bottom: 1px solid #86cf9e;
  }

  & ::v-deep .vue-slider-dot-handle {
    height: 8px;
    top: 4px;
    background-color: #86cf9e;
    @apply relative w-1/3 shadow-none;
  }

  & ::v-deep .vue-slider-dot {

    &:nth-of-type(3) {
      & .vue-slider-dot-handle {
        transform: translateX(150%);
        @apply rounded-r-none;
      }
    }

    &:last-of-type {
      & .vue-slider-dot-handle {
        transform: translateX(75%);
        @apply rounded-l-none;
      }
    }

    & .vue-slider-dot-tooltip-inner {
       background-color: #86cf9e;
       border-color: #86cf9e;
    }
  }

  & ::v-deep .vue-slider-mark-label {
    top: initial;
    margin-top: initial;
    bottom: 200%;
  }
}
</style>
