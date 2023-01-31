<template>
  <div>
    <div
      v-for="(range, index) in ranges"
      :key="`timeband-range-${index}`"
      class="grid grid-cols-2 col-gap-3"
    >
      <cw-input-time
        v-model="range.from"
        class="pr-2"
        :label="$t('gym.open_hours.from')"
        :placeholder="$t('gym.open_hours.from')"
        :rules="range.rules.from"
        :tooltip="tooltipFrom"
        @change="addRange(range, index)"
      />
      <cw-input-time
        v-model="range.to"
        class="pl-2"
        :label="$t('gym.open_hours.to')"
        :placeholder="$t('gym.open_hours.to')"
        :rules="range.rules.to"
        :tooltip="tooltipTo"
        @change="addRange(range, index)"
      />
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    rules: { type: Object, default: () => ({}) },
    value: { type: Array, default: () => [] },
    tooltipFrom: { type: String, default: 'From' },
    tooltipTo: { type: String, default: 'To' }
  },
  data: () => ({ ranges: [], mask: [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/] }),
  watch: {
    ranges: {
      deep: true,
      handler (ranges) {
        this.$emit(
          'input',
          ranges.filter(range => range.from && range.to)
        )
      }
    }
  },
  created () {
    this.ranges = this.value.concat({
      from: this.value.length ? null : '07:00',
      to: this.value.length ? null : '22:00'
    })
    this.setRangeRules()
  },
  methods: {
    addRange (range, index) {
      if (range.from && range.to && Number(index) + 1 >= this.ranges.length) {
        this.ranges.push({
          from: null,
          to: null,
          rules: this.getRules(this.ranges[index])
        })
      } else if (
        !range.from &&
        !range.to &&
        this.ranges.length - 1 > Number(index)
      ) {
        this.ranges.splice(Number(index), 1)
      }
      this.setRangeRules()
    },
    getRules (previous = undefined, current = undefined, next = undefined) {
      const range = {
        from: !!previous && !!previous.to ? previous.to : null,
        to: !!next && !!next.from ? next.from : '24:00'
      }

      return {
        from: !next
          ? []
          : [
            this.rules.required,
            this.rules.minTime(range.from),
            this.rules.maxTime(
              !!current && current.to ? current.to : range.to
            )
          ],
        to: !next
          ? []
          : [
            this.rules.required,
            this.rules.minTime(
              !!current && current.from ? current.from : range.from
            ),
            this.rules.maxTime(range.to)
          ]
      }
    },
    setRangeRules () {
      for (const [index, range] of Object.entries(this.ranges)) {
        this.ranges[Number(index)].rules = this.getRules(
          this.ranges[Number(index) - 1],
          range,
          this.ranges[Number(index) + 1]
        )
      }
    }
  }
}
</script>
