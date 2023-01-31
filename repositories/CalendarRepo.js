export default ctx => ({
  createActivity: payload =>
    ctx.$socket.request('activity/calendar/createActivity', payload),
  createAsset: payload =>
    ctx.$socket.request('assets/calendar/createAsset', payload),
  createCourse: payload =>
    ctx.$socket.request('course/calendar/createCourse', payload),
  deleteActivity: activityId =>
    ctx.$socket.request('activity/calendar/deleteActivity', activityId),
  deleteCourse: courseId =>
    ctx.$socket.request('course/calendar/deleteCourse', { courseId }),
  getActivities: () => ctx.$socket.request('activity/calendar/getActivities'),
  getCourses: () => ctx.$socket.request('course/calendar/getCourses'),
  getRentables: () => ctx.$socket.request('rentable/calendar/getRentables'),
  gymAssets: gymId =>
    ctx.$socket.request('assets/calendar/gymAssets', { gymId }),
  saveRentable: rentable =>
    ctx.$socket.request(
      `rentable/calendar/${rentable._id ? 'update' : 'create'}Rentable`,
      { ...rentable, rentableId: rentable._id }
    ),
  updateActivity: payload =>
    ctx.$socket.request('activity/calendar/updateActivity', payload),
  updateAsset: payload =>
    ctx.$socket.request('assets/calendar/updateAsset', payload)
})
