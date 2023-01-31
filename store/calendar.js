const SET_STATE = 'setState'

export const state = () => ({
  trainers: [],
  activities: [],
  courses: [],
  gymAssets: [],
  rentables: [],
  selectedDate: null
})

export const getters = {
  // courseColorFrequency: (state) => {
  //   const output = {}
  //   state.courses.forEach(({ color }) => {
  //     output[color] = (output[color] ?? 0) + 1
  //   })
  //   return output
  // },

  usedCourseColors: (state) => {
    const output = {}
    state.courses.forEach(({ color }) => {
      output[color] = true
    })
    return output
  },

  lessonsByDate: (state) => {
    const output = {}

    state.courses.forEach((course) => {
      course.lessons.forEach((lesson) => {
        lesson.entries.forEach((entry) => {
          const lessonDayStart = new Date(entry.datetime.start)
          lessonDayStart.setHours(0, 0, 0, 0)
          const key = lessonDayStart.toISOString()
          output[key] = output[key] ?? []
          output[key].push({
            color: course.color,
            courseName: course.name,
            description: course.description,
            age: course.age,
            reporting: course.reporting,
            note: course.note,
            ...entry
          })
        })
      })
    })

    return output
  },

  getAsset: state => id => state.gymAssets.find(s => s._id === id),

  // for quick lookups
  assetsById: (state) => {
    const output = {}

    state.gymAssets.forEach((asset) => {
      output[asset._id] = asset
    })

    return output
  },

  // for quick lookups
  trainersById: (state) => {
    const output = {}

    state.trainers.forEach((trainer) => {
      output[trainer._id] = trainer
    })

    return output
  }
}

export const mutations = {
  SET_TRAINERS (state, val) {
    state.trainers = val
  },
  ADD_ACTIVITY (state, val) {
    state.activities.push(val)
  },
  ADD_GYM_ASSET (state, gymAsset) {
    state.gymAssets.push(gymAsset)
  },
  DELETE_ACTIVITY (state, val) {
    const index = state.activities.findIndex(activity => activity._id === val)
    state.activities.splice(index, 1)
  },
  DELETE_ASSET (state, val) {
    const index = state.gymAssets.findIndex(gymAsset => gymAsset._id === val)
    state.gymAssets.splice(index, 1)
  },
  DELETE_COURSE (state, courseId) {
    const index = state.courses.findIndex(course => course._id === courseId)
    state.courses.splice(index, 1)
  },
  SET_DATE (state, val) {
    state.selectedDate = val
  },
  SET_COURSES (state, val) {
    state.courses = val
  },
  SET_COURSE (state, val) {
    state.courses.push(val)
  },
  SET_GYM_ASSETS (state, gymAssets) {
    state.gymAssets = gymAssets
  },
  [SET_STATE] (state, changes) {
    Object.entries(changes).forEach(([key, val]) => {
      if (key in state) {
        state[key] = val
      }
    })
  },
  UPDATE_ASSET (state, gymAsset) {
    const gymAssetIndex = state.gymAssets.findIndex((item) => {
      return item._id === gymAsset._id
    })
    if (gymAssetIndex !== -1) {
      state.gymAssets.splice(gymAssetIndex, 1, gymAsset)
    }
  },
  SET_ACTIVITIES (state, val) {
    state.activities = val
  },
  UPDATE_ACTIVITY (state, val) {
    const index = state.activities.findIndex((item) => {
      return item._id === val._id
    })
    if (index !== -1) {
      state.activities.splice(index, 1, val)
    }
  }
}

export const actions = {
  getTrainers ({ commit }) {
    return this.$repos.contactsRepo.getBusinessUsers(
      this.$auth.user._id
    )
      .then((res) => {
        const trainers = res.filter(user => user.roles.some(({ role }) => role === 'TR'))
        commit('SET_TRAINERS', trainers)
      })
  },
  createAsset ({ commit }, payload) {
    const promise = this.$repos.calendarRepo.createAsset(payload)

    return promise.then((res) => {
      if (res.success) {
        commit('ADD_GYM_ASSET', { ...res.data, print: false })
      }
      return res
    })
  },
  createCourse ({ commit }, payload) {
    return this.$repos.calendarRepo.createCourse(payload).then((res) => {
      if (res.success) {
        commit('SET_COURSE', res.data.course)
      }
    })
  },
  deleteActivity ({ commit }, activityId) {
    return this.$repos.calendarRepo.deleteActivity(activityId).then((res) => {
      if (res.success) {
        commit('DELETE_ACTIVITY', activityId)
      }
      return res
    })
  },
  deleteAsset ({ commit }, payload) {
    const promise = this.$repos.calendarRepo.updateAsset({
      ...payload,
      isDeleted: true
    })

    return promise.then((res) => {
      if (res.success) {
        commit('DELETE_ASSET', payload._id)
      }
      return res
    })
  },
  deleteCourse ({ commit }, courseId) {
    return this.$repos.calendarRepo.deleteCourse(courseId).then((res) => {
      if (res.success) {
        commit('DELETE_COURSE', courseId)
      }
    })
  },
  async getActivities ({ commit }) {
    const activities = await this.$repos.calendarRepo.getActivities()
    commit('SET_ACTIVITIES', activities.data?.activities)
  },
  getCourses ({ commit }) {
    return this.$repos.calendarRepo.getCourses().then((res) => {
      if (res.success) {
        commit('SET_COURSES', res.data.courses)
      }
    })
  },
  async getGymAssets ({ commit }, gymId) {
    const gymAssets = await this.$repos.calendarRepo.gymAssets(gymId)
    commit('SET_GYM_ASSETS', gymAssets.data)
  },
  async getRentables ({ commit }) {
    const rentables = await this.$repos.calendarRepo.getRentables()
    commit(SET_STATE, { rentables })
  },
  saveActivity ({ commit }, payload) {
    const promise = payload?._id
      ? this.$repos.calendarRepo.updateActivity({
        activityId: payload._id,
        ...payload
      })
      : this.$repos.calendarRepo.createActivity(payload)
    return promise.then((res) => {
      if (res.success) {
        commit(
          payload?._id ? 'UPDATE_ACTIVITY' : 'ADD_ACTIVITY',
          res.data.activity
        )
      }
      return res
    })
  },
  async saveRentable ({ dispatch }, rentable) {
    await this.$repos.calendarRepo.saveRentable(rentable)
    dispatch('getRentables')
  },
  updateGymAsset ({ commit }, payload) {
    const promise = this.$repos.calendarRepo.updateAsset(payload)

    return promise.then((res) => {
      if (res.success) {
        commit('UPDATE_ASSET', res.data)
      }
      return res
    })
  }
}
