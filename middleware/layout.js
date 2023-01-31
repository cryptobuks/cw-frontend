
export default function layoutMiddleware (ctx) {
  if (ctx.$auth.isAuthenticated) {
    const options = ctx.route.matched?.[0]?.components?.default?.options
    if (options && !options.layout) {
      options.layout = ctx.$auth.profileType().interface
    }
  }
}
