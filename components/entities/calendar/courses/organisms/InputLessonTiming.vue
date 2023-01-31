<template>
  <div @focusin="$attrs.listeners.focus">
    <div class="flex space-x-6">
      <cw-input-time
        :value="start"
        :label="$attrs.startLabel"
        :placeholder="$attrs.startPlaceholder"
        :tooltip="$attrs.timingTooltip"
        @input="$emit('update:start', $event)"
        @blur="onBlur($attrs.listeners.validated, $attrs.listeners.error)"
      />
      <cw-input-time
        :value="end"
        :label="$attrs.endLabel"
        :placeholder="$attrs.endPlaceholder"
        :tooltip="$attrs.timingTooltip"
        @input="$emit('update:end', $event)"
        @blur="onBlur($attrs.listeners.validated, $attrs.listeners.error)"
      />
      <cw-input-time
        v-model="duration"
        :label="$attrs.durationLabel"
        :placeholder="$attrs.durationPlaceholder"
        :tooltip="$attrs.timingTooltip"
        @blur="onBlur"
      />
    </div>
    <base-input-text
      v-if="!hideSanification"
      type="number"
      min="0"
      max="120"
      :value="sanification"
      class="ml-auto"
      style="width: 50%"
      :label="$attrs.sanificationLabel"
      :placeholder="$attrs.sanificationPlaceholder"
      :tooltip="$attrs.sanificationTooltip"
      affix="min"
      @input="$emit('update:sanification', parseInt($event))"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { parseTimeString, getTimeString } from '@/components/entities/calendar/utils'
import { lessonDraftObservable } from '../shared'

export default {
  inheritAttrs: false,
  props: {
    start: { type: String, default: '' },
    end: { type: String, default: '' },
    sanification: { type: Number, default: null },
    hideSanification: Boolean
  },
  data: () => ({
    duration: ''
  }),
  computed: {
    ...mapState('calendar', ['gymAssets']),
    rooms () {
      const res = lessonDraftObservable.location.filter(({ type }) => type === 'room')

      const roomIds = {}

      res.forEach(({ roomId }) => {
        roomIds[roomId] = true
      })

      return this.gymAssets.filter(asset => roomIds[asset._id])
    }
  },
  watch: {
    start (v) {
      const duration = parseTimeString(this.end ?? '') - parseTimeString(v ?? '')

      if (this.end && duration >= 0) {
        this.duration = getTimeString(duration)
      }
    },
    end (v) {
      const duration = parseTimeString(v ?? '') - parseTimeString(this.start ?? '')

      if (this.start && duration >= 0) {
        this.duration = getTimeString(duration)
      }
    },
    duration (v) {
      const end = parseTimeString(this.start ?? '') + parseTimeString(this.duration ?? '')

      if (this.start && end < 24) {
        this.$emit('update:end', getTimeString(end))
      }
    },
    rooms () {
      if (this.rooms.length) {
        const res = this.rooms.map(({ sanification }) => sanification).filter(i => i !== undefined)
        if (res.length) {
          const averageSanificationTime = res.reduce((prev, curr) => prev + curr, 0) / res.length

          this.$emit('update:sanification', averageSanificationTime)
        }
      }
    }
  },
  methods: {
    onBlur (validated, error) {
      const valid = !!(this.start && this.end && this.start < this.end)

      if (valid) {
        validated?.()
        this.$emit('validated')
      } else {
        error?.()
      }
    }
  }
}
</script>
