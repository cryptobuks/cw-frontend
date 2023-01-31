import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('chat', ['filterTarget']),
    filterTags () {
      const { filter } = this.source ?? {}

      // TODO: Handle `courses` as well
      const profiles = filter?.profiles ? this.filterTarget.profiles.filter(profile => filter.profiles.includes(profile._id)) : []
      const roles = filter?.roles ? this.filterTarget.roles.filter(role => filter.roles.includes(role.key)) : []
      const interests = filter?.interests ? this.filterTarget.interests.filter(interest => filter.interests.includes(interest._id)) : []

      return this.normalizeFilter({ profiles, roles, interests })
    }
  },
  methods: {
    normalizeFilter (filter) {
      const query = new URLSearchParams(location.search)
      const lang = query.get('language')
      const locale = lang === 'en' || lang === 'it' ? lang : 'en'

      // TODO: Handle `courses` as well. And `roles` will probably need translations.
      const profiles = (filter?.profiles ?? [])
        .map((profile) => {
          const text = profile.firstname || profile.lastname ? `${profile.firstname || ''} ${profile.lastname || ''}`.trim() : profile._id
          return { id: profile._id, text, type: 'profile', value: { ...profile, type: 'profile' } }
        })
      const roles = (filter.roles ?? [])
        .map(role => ({ id: role.key, text: role.name, value: { ...role, type: 'role' } }))
      const interests = (filter.interests ?? [])
        .map(interest => ({ id: interest._id, text: interest.translations[locale] || interest.name, value: { ...interest, type: 'interest' } }))

      return profiles.concat(roles, interests)
    },
    filterTagsMethod (tags) {
      const filter = tags

      // TODO: Handle `courses` as well
      const profiles = filter?.profiles ? this.filterTarget?.profiles?.filter(profile => filter.profiles.includes(profile._id)) : []
      const roles = filter?.roles ? this.filterTarget?.roles?.filter(role => filter.roles.includes(role.key)) : []
      const interests = filter?.interests ? this.filterTarget?.interests?.filter(interest => filter.interests.includes(interest._id)) : []

      return this.normalizeFilter({ profiles, roles, interests })
    }
  }
}
