// By default, this middleware treats all pages component as protected route
// To override this behavior, explicitly set the compnent's auth option as following
// { auth: true } authenticated users only, is default for all pages
// { auth: false } everyone
// { auth: 'guest' } unauthenticated guests only
// TODO { auth: 'individual' | 'business' } authenticated users with specific typeCode only

import { get } from 'lodash-es'

export default function authMiddleware (ctx) {
  // Take the last value (latest route child)
  const permissionPathString = ctx.route.meta.reduce((permission, meta) => meta.permission || permission, '')
  // TODO: Perhaps make the default false after all permissions have been defined.
  const isPermitted = get((ctx.$auth.user?.permission ?? {}), permissionPathString, true)

  const authOptions = ctx.$auth.getRouteAuthOptions()
  if (authOptions.includes(false)) {
    return
  }

  // Disable middleware if no route was matched to allow 404/error page
  const is404 = !authOptions.length
  if (is404) {
    return
  }

  const isGuestOnly = authOptions.includes('guest')

  if (ctx.$auth.isAuthenticated) {
    if (
      isGuestOnly ||
      (authOptions.includes('business') && !ctx.$auth.isBusiness()) ||
      (authOptions.includes('individual') && !ctx.$auth.isIndividual()) ||
      !isPermitted
    ) {
      return ctx.redirect('/')
    }
  } else if (!isGuestOnly) {
    if (location.pathname === '/') {
      // For handling QR code params in home page
      return ctx.redirect('/login/' + location.search)
    }

    const params = new URLSearchParams(location.search.replace('?', ''))
    // For auto redirect to authenticated route after login
    params.append('target_uri', encodeURIComponent(location.pathname + location.search))

    // For handling QR code params in home page
    return ctx.redirect(['/login/', params.toString()].filter(Boolean).join('?'))
  }
}
