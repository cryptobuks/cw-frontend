export default function (context) {
  const { $auth, route, store } = context

  if ($auth.isBusiness() && !store.state.contacts.businessUsers.length) {
    store.dispatch('contacts/getBusinessUsers')
  }

  if ($auth.user && route.fullPath.startsWith('/calendar')) {
    store.dispatch('calendar/getCourses')
    store.dispatch('calendar/getActivities')
    store.dispatch('calendar/getTrainers', $auth.user._id)
    store.dispatch('calendar/getGymAssets', $auth.user._id)
  }
}
