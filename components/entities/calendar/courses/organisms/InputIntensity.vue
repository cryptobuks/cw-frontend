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
    <span class="uppercase ml-2">
      {{ $t('calendar.course_modal.intensity.label') }}
    </span>
    <vue-slider
      :value="value"
      :min="1"
      :max="100"
      class="intensity-slider flex-1 ml-4"
      :marks="marks"
      tooltip="always"
      tooltip-placement="bottom"
      :tooltip-formatter="tooltipFormatter"
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
    value: { type: Number, default: 1 }
  },
  data: () => {
    const markStyle = {
      width: '12px',
      height: '12px',
      display: 'block',
      backgroundColor: '#ffffff',
      transform: 'translate(-25%, -40%)'
    }

    return {
      marks: {
        1: {
          label: '1',
          style: markStyle
        },
        100: {
          label: '100',
          style: markStyle
        }
      }
    }
  },
  methods: {
    tooltipFormatter (v) {
      const category = v <= 16
        ? 'Poor'
        : v <= 33
          ? 'Light'
          : v <= 50
            ? 'Medium'
            : v <= 66
              ? 'Intense'
              : v <= 83
                ? 'Very Intense'
                : 'Professional'
      return `${category} (${v})`
    }
  }
}
</script>

<style lang="postcss" scoped>
.intensity-slider {
  & ::v-deep .vue-slider-rail {
    height: 2px;
  }

  & ::v-deep .vue-slider-process {
    @apply hidden;
  }

  & ::v-deep .vue-slider-dot-handle {
    background-color: #86cf9e;
  }

  & ::v-deep .vue-slider-dot-tooltip-inner {
      background-color: #86cf9e;
      border-color: #86cf9e;
  }

  & ::v-deep .vue-slider-mark-label {
    top: initial;
    margin-top: initial;
    bottom: 200%;
  }
}
</style>
