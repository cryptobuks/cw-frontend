<template>
  <label
    class="relative flex flex-col justify-center items-center bg-gray-500 text-sm text-white font-semibold w-12 h-12 rounded-md cursor-pointer"
  >
    <input type="radio" :checked="checked_" :value="value" @change="$emit('change', value)">
    <span>{{ weekdayLetter }}</span>
    <span>{{ date }}</span>
    <div class="absolute flex justify-center items-center top-0 left-0 bg-white w-2 h-2 m-1 rounded-full z-10">
      <base-icon name="check" size="10" class="flex-shrink-0 text-black" :style="{ display: !checked_ ? 'none' : null }" />
    </div>
  </label>
</template>

<script>
export default {
  model: {
    prop: 'modelValue',
    event: 'change'
  },
  props: {
    modelValue: Date,
    value: { type: Date, required: true },
    checked: { type: Boolean, default: null }
  },
  data: () => ({
    weekdays: [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ]
  }),
  computed: {
    weekdayLetter () {
      const weekday = this.$t(`days.${this.weekdays[this.value.getDay()]}`)
      return weekday[0]
    },
    date () {
      return this.value.getDate().toString().padStart(2, '0')
    },
    checked_ () {
      if (this.checked !== null) {
        return this.checked
      }

      if (this.modelValue) {
        const a = new Date(this.modelValue.getTime())
        a.setHours(0, 0, 0, 0)
        const b = new Date(this.value.getTime())
        b.setHours(0, 0, 0, 0)

        return a.getTime() === b.getTime()
      } else {
        return true
      }
    }
  }
}
</script>
