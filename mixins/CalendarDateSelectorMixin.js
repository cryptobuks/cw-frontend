export default {
  model: {
    prop: 'selectedDate',
    event: 'select-date'
  },
  props: {
    baseDate: { type: Date, required: true },
    dateShift: { type: Number, required: true },
    selectedDate: {
      validator: v => v instanceof Date || v === null
    }
  },
  data () {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return {
      today,
      weekdays: [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ]
    }
  }
}
