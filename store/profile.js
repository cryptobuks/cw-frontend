const SET_STATE = 'setState'
const RECEIVE_GYM = 'receiveGym'
const REMOVE_GYM = 'removeGym'
const SET_SINGLE_GYM = 'setSingleGym'
const SET_USER_ROLES = 'setUserRoles'

const PROFILE_RBAC = {
  'business.auth-contacts': { roles: ['DI'] },
  'business.app-background': { roles: ['DI'] },
  'business.block-unblock': { roles: ['DI'] },
  'business.chat-plugin': { roles: ['DI'] },
  'business.contracts': { roles: ['DI'] },
  'business.credit-wallet': { roles: ['DI'] },
  'business.edit': { roles: ['DI'] },
  'business.edit-gym-hours': { roles: ['DI'] },
  'business.export-contacts': { roles: ['DI'] },
  'business.gym-devices': { roles: ['DI'] },
  'business.import-contacts': { roles: ['DI'] },
  'business.qr-code': { roles: ['DI'] },
  'user.block-unblock': {
    roles: ['DI', 'OP', 'TT', 'SP']
  },
  'user.certificates': { roles: ['DI', 'OP', 'TT'] },
  'user.contracts': { roles: ['DI', 'OP', 'TT', 'SP'] },
  'user.edit': { roles: ['DI', 'OP', 'TT', 'SP'] },
  'user.info.address': { roles: ['DI', 'OP', 'SP'] },
  'user.info.emails': { roles: ['DI', 'OP', 'SP'] },
  'user.info.mobiles': { roles: ['DI', 'OP', 'SP'] },
  'user.info.landlines': { roles: ['DI', 'OP', 'SP'] },
  'user.info.pins': { roles: ['DI', 'OP', 'SP'] },
  'user.info.placeOfBirth': { roles: ['DI', 'OP', 'SP'] },
  'user.info.tins': { roles: ['DI', 'OP', 'SP'] },
  'user.subscriptions': { roles: ['TT'] },
  'user.training-plans': { roles: ['TT'] },
  'user.weight_and_price': { roles: ['TT'] }
}

export const state = () => ({
  codiceAtecoSuggestions: [],
  gyms: [],
  italyCompanyTypes: [
    { _id: 'individuale', text: 'Individuale' },
    { _id: 'sas', text: 'S.a.s. (società in accomandita semplice)' },
    { _id: 'snc', text: 'S.n.c. (società in nome collettivo)' },
    { _id: 'srl', text: 'S.r.l. (società a responsabilità limitata)' },
    {
      _id: 'srls',
      text: 'S.r.ls.(società a responsabilità limitata semplificata)'
    },
    { _id: 'spa', text: 'S.p.A. (società per azioni)' },
    { _id: 'asd', text: 'A.S.D. (associazione sportiva dilettantistica)' },
    { _id: 'ssd', text: 'S.S.D. (associazione sportiva dilettantistica)' },
    { _id: 'odv', text: 'ODV (organizzazione di volontariato) ' },
    { _id: 'ets', text: 'ETS (ente terzo settore)' },
    { _id: 'aps', text: 'APS (associazioni di promozione sociale)' },
    { _id: 'impresaSociale', text: 'Impresa sociale' },
    {
      _id: 'entiEFederazioni',
      text: 'Enti e federazioni sportive (riconosciute dal CONI)'
    }
  ],
  managedProfiles: [],
  profileBio: [],
  profile: null,
  roles: ['CL', 'CT', 'DI', 'OP', 'RE', 'SP', 'SA', 'PT', 'TT'],
  singleGym: {},
  userRelationship: null,
  userRoles: []
})

export const mutations = {
  [SET_STATE] (state, changes) {
    Object.entries(changes).forEach(([key, val]) => {
      if (key in state) {
        state[key] = val
      }
    })
  },

  [RECEIVE_GYM] (state, gym) {
    const i = state.gyms.findIndex(g => g._id === gym._id)
    if (i === -1) {
      state.gyms.push(gym)
    } else {
      state.gyms.splice(i, 1, { ...state.gyms[i], ...gym })
    }
  },

  [REMOVE_GYM] (state, _id) {
    const i = state.gyms.findIndex(g => g._id === _id)
    if (i !== -1) {
      state.gyms.splice(i, 1)
    }
  },
  [SET_SINGLE_GYM] (state, gym) {
    state.singleGym = gym
  },

  SET_PROFILE_BIO (state, profileBio) {
    state.profileBio = profileBio
  },
  [SET_USER_ROLES] (state, userRoles) {
    state.userRoles = userRoles
  }
}

export const actions = {
  changeCompanyStatus ({ commit }, { id, status }) {
    return this.$repos.profileRepo.changeCompanyStatus(id, status).then((ok) => {
      ok && commit(RECEIVE_GYM, { _id: id, status })
    })
  },

  fetchGyms ({ commit }) {
    return this.$repos.profileRepo
      .getGyms()
      .then(gyms => commit(SET_STATE, { gyms }))
  },

  getBio ({ commit }, payload) {
    return this.$repos.profileRepo.bio
      .get(payload)
      .then(profileBio => commit(SET_STATE, { profileBio }))
  },

  async getCodiceAtecoSuggestions ({ state, commit }) {
    if (!state.codiceAtecoSuggestions.length) {
      commit(SET_STATE, {
        codiceAtecoSuggestions: await this.$repos.profileRepo.getCodiceAtecoSuggestions()
      })
    }
  },

  async getManagedProfiles ({ commit }) {
    const managedProfiles = await this.$repos.profileRepo.getManagedProfileList()
    commit(SET_STATE, { managedProfiles })
  },

  async getProfile ({ commit }, profileId) {
    const [profile, profileDetail] = await Promise.all([
      this.$repos.profileRepo.getProfileById(profileId),
      this.$repos.profileRepo.getProfileDetail(profileId)
    ])

    commit(SET_STATE, { profile: { ...profile, ...profileDetail } })
  },

  async getSingleGym ({ commit }, gymId) {
    const gymDetail = await this.$repos.profileRepo.getGymById(gymId)
    commit(SET_SINGLE_GYM, gymDetail)
  },

  async getUserRelationship ({ commit }, { leftProfileId, rightProfileId }) {
    const userRelationship = await this.$repos.contactsRepo.verifyContactRelationship(
      leftProfileId,
      rightProfileId
    )
    commit(SET_STATE, { userRelationship })
    return userRelationship
  },
  async getUserRoles ({ commit, dispatch, state }) {
    const profile = state.profile
    let userRoles = []
    const relationship = await dispatch('getUserRelationship', {
      leftProfileId: profile._id,
      rightProfileId: this.$auth.user._id
    })
    // no roles for business viewing business
    // business viewing user
    if (this.$auth.isBusiness() && this.$auth.isUser(profile.typeCode)) {
      userRoles = await this.$repos.profileRepo.individual.getGymRoles({
        gymId: this.$auth.user._id,
        profileId: profile._id
      })
    }
    // user viewing business
    if (this.$auth.isUser() && this.$auth.isBusiness(profile.typeCode)) {
      userRoles = await this.$repos.profileRepo.individual.getGymRoles({
        gymId: profile._id,
        profileId: this.$auth.user._id
      })
    }
    // user viewing user
    if (this.$auth.isUser() && this.$auth.isUser(profile.typeCode)) {
      userRoles = (relationship?.roles || []).map(r => r.role)
    }

    commit(SET_STATE, { userRoles })
  },

  mutateGym ({ commit }, gym) {
    return this.$repos.profileRepo.mutateGym(gym).then((newGym) => {
      newGym && commit(RECEIVE_GYM, newGym)
      return newGym
    })
  },

  reactivateGym ({ commit }, _id) {
    return this.$repos.profileRepo.reactivateGym(_id).then((res) => {
      commit(RECEIVE_GYM, { _id, status: res.data.status })
    })
  },
  removeGym ({ commit }, gym) {
    return this.$repos.profileRepo.removeGym(gym._id).then(() => {
      commit(REMOVE_GYM, gym._id)
      return true
    })
  }
}

export const getters = {
  allowed: ({ userRoles }) => action =>
    userRoles.some(
      role =>
        !PROFILE_RBAC[action] ||
        (PROFILE_RBAC[action]?.roles || []).includes(role)
    ),

  businessRoles (state) {
    return state.roles.filter(r => !['TT', 'RE', 'CL'].includes(r))
  },

  codiceAtecoById: state => id =>
    state.codiceAtecoSuggestions.find(c => c._id === id)?.desc || '',

  getSortedBio: (state) => {
    return (
      state.profileBio &&
      state.profileBio.slice().sort((a, b) => {
        let diff = new Date(b.measuredAt) - new Date(a.measuredAt)
        if (diff === 0) {
          diff = new Date(b.createdAt) - new Date(a.createdAt)
        }
        return diff
      })
    )
  },

  italyCompanyTypesById: state => id =>
    state.italyCompanyTypes.find(t => t._id === id)?.text || '',

  viewingSelf: ({ profile }) => $auth => $auth.user._id === profile._id
}
