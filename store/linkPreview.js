const millisecondsInDay = 1000 * 60 * 60 * 24
const timeoutCache = millisecondsInDay * 3

export const state = () => ({
  linksPreview: {}
})

export const getters = {

}

export const mutations = {

  SET_LINK_PREVIEW (state, { payload, link }) {
    state.linksPreview[link] = { payload, time: Date.now() }
  },

  CLEAR_OLD_LINK_PREVIEW (state) {
    const now = Date.now()

    for (const key in state.linksPreview) {
      if (state.linksPreview[key].time + timeoutCache < now) {
        delete state.linksPreview[key]
      }
    }
  }
}

export const actions = {

  async getPreview (ctx, link) {
    if (ctx.state.linksPreview[link]?.payload) {
      return ctx.state.linksPreview[link].payload
    }

    const payload = await this.$repos.chatRepo.getPreview({ link })
    if (payload?.data) {
      ctx.commit('SET_LINK_PREVIEW', { payload, link })
      return payload
    }
    return {}
  }
}
