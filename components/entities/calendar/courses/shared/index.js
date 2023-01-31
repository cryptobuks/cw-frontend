import Vue from 'vue'

const getCourseDraftInitialState = () => ({
  color: '',
  name: '',
  description: '',
  sports: [],
  activityId: '',
  age: { min: 0, max: 100 },
  lessons: [],
  inPresence: {
    price: 0,
    singleBuy: false
  },
  inRemote: {
    price: 0,
    singleBuy: false
  },
  singleBuyDate: {
    start: null,
    end: null
  },
  limitSingleBuy: false,
  vatRateId: '',
  intensity: 1,
  note: '',
  chatGroup: true,
  reporting: true,
  isPublic: true,
  guests: []
})

const getLessonDraftInitialState = () => ({
  location: [],
  time: {
    start: null,
    end: null
  },
  sanificationTime: null,
  period: 'week',
  recurrence: 1,
  dayOfWeek: [],
  datetime: {
    start: null,
    end: null,
    endAfter: null
  },
  trainerIds: [],
  entries: []
})

export const courseDraftObservable = Vue.observable(getCourseDraftInitialState())
export const lessonDraftObservable = Vue.observable(getLessonDraftInitialState())

courseDraftObservable.reset = function () {
  Object.assign(this, getCourseDraftInitialState())
}

lessonDraftObservable.reset = function () {
  Object.assign(this, getLessonDraftInitialState())
}
