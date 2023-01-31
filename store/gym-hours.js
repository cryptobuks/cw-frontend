import { digitToDate, setTime } from '../plugins/utils'

const SET_GYM_HOURS = 'setGymHours'

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

function formatExceptionDates (exceptions) {
  return exceptions.map(exception => ({
    ...exception,
    from: Number(exception.from),
    to: Number(exception.to),
    dates: {
      from: digitToDate(exception.from),
      to: digitToDate(exception.to)
    }
  }))
}

export const state = () => ({
  defaultGymHours: {
    exceptions: [],
    weekdays: WEEKDAYS.map(weekDay => ({
      day: weekDay.toLowerCase().substr(0, 3),
      time: [
        {
          from: '07:00',
          to: '22:00'
        }
      ]
    }))
  },
  gymHours: null,
  gymRooms: []
})

export const mutations = {
  [SET_GYM_HOURS] (state, gymHours) {
    state.gymHours = gymHours
  }
}

export const actions = {
  async getGymHours ({ commit, state }, gymId) {
    let gymHours = await this.$repos.gymHoursRepo.getGymHours(gymId)
    if (!gymHours) {
      commit(SET_GYM_HOURS, { ...state.defaultGymHours, gymId })
      gymHours = this.$utils.clone({ ...state.defaultGymHours, gymId })
    }
    gymHours.exceptions = formatExceptionDates(gymHours.exceptions)
    for (const weekday of gymHours.weekdays) {
      weekday.time.sort((a, b) => {
        const [aFrom] = a.from.split(':')
        const [bFrom] = b.from.split(':')
        return Number(aFrom) - Number(bFrom)
      })
    }
    commit(SET_GYM_HOURS, gymHours)
  },
  async setGymHours ({ commit, rootState, state }, { exceptions, weekdays }) {
    const gymHours = await this.$repos.gymHoursRepo.setGymHours(
      rootState.profile.profile?._id,
      {
        exceptions: exceptions || state.gymHours.exceptions,
        weekdays: weekdays || state.gymHours.weekdays
      }
    )
    if (gymHours) {
      gymHours.exceptions = formatExceptionDates(gymHours.exceptions)
      commit(SET_GYM_HOURS, gymHours)
    }
    return this.$utils.clone(gymHours)
  }
}

export const getters = {
  closedDays: (state, getters) => () => {
    const weekdays = getters.gymWeekDays()
    const closeddays = []
    for (let i = 0; i < weekdays.length; i++) {
      if (weekdays[i].closed === true) {
        closeddays.push((i + 1) % 7)
      }
    }
    return closeddays
  },
  gymStatus: ({ gymHours }) => (currentDate = new Date()) => {
    if (!gymHours) {
      return { closed: true }
    }
    currentDate = new Date(currentDate)
    currentDate.setHours(new Date().getHours())

    const dayOfWeek = Intl.DateTimeFormat('en-US', { weekday: 'short' })
      .format(currentDate)
      .toLowerCase()
    const gymDay = gymHours.weekdays.find(day => day.day === dayOfWeek)

    for (const exception of gymHours.exceptions) {
      if (
        // today falls on one of the closed exception days
        exception.isClosed &&
        setTime(exception.dates.from, '00:00') <= currentDate &&
        setTime(exception.dates.to, '23:59') >= currentDate &&
        !!gymDay
      ) {
        return { closed: true }
      } else if (
        // today falls on one of the open exception days
        !exception.isClosed &&
        exception.dates.from <= currentDate &&
        exception.dates.to >= currentDate &&
        !gymDay
      ) {
        for (const time of exception.time) {
          const opens = setTime(currentDate, time.from)
          const closes = setTime(currentDate, time.to)
          if (opens <= currentDate && closes >= currentDate) {
            return { closed: false, day: dayOfWeek, time: exception.time }
          }
        }
      }
    }

    if (!gymDay) {
      return { closed: true }
    }

    for (const time of gymDay.time) {
      const opens = setTime(currentDate, time.from)
      const closes = setTime(currentDate, time.to)
      if (opens <= currentDate && closes >= currentDate) {
        return { closed: false, ...gymDay }
      }
    }

    return { closed: true }
  },

  gymWeekDays: ({ gymHours }) => () => {
    if (!gymHours) {
      return []
    }
    return WEEKDAYS.map((longDay) => {
      const dayOfWeek = longDay.toLowerCase().substr(0, 3)

      const gymDay = gymHours.weekdays.find(day => day.day === dayOfWeek)
      return gymDay
        ? { longDay, ...gymDay, closed: false }
        : { longDay, day: dayOfWeek, closed: true }
    })
  }
}
