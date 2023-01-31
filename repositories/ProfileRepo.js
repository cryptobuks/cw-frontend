import { wsResponseHandler } from '~/plugins/utils'

export default function (ctx) {
  const cache = {}

  const { $socket } = ctx

  const useCache = async (prefix, key, getValue) => {
    const keyWithPrefix = prefix + ':' + key
    if (keyWithPrefix in cache) {
      return cache[keyWithPrefix]
    }

    cache[keyWithPrefix] = await getValue()

    setTimeout(() => {
      delete cache[keyWithPrefix]
    }, 60000)

    return cache[keyWithPrefix]
  }

  const repos = {
    // Relation
    access: {
      getAccess (payload) {
        return ctx.$socket
          .request(
            'access/auth/getAccess',
            ctx.$utils.extract(
              payload,
              ['invitedBy', 'invitedTo', 'action', 'assetId'],
              { ignoreNull: true }
            )
          )
          .then(res => res.success)
      },

      getAccessLog: payload =>
        ctx.$socket
          .request('access/auth/getAccessLog', payload)
          .then(wsResponseHandler),

      getCurrentRelationStatus ({ invitedBy, invitedTo, action }) {
        return ctx.$socket
          .request('access/auth/getCurrentRelationStatus', {
            invitedBy,
            invitedTo
          })
          .then(
            res =>
              res.data?.status ||
              ctx.$socket
                .request('access/auth/getAccess', {
                  invitedBy,
                  invitedTo,
                  action
                })
                .then(res => res.data?.status)
          )
      }
    },
    appBackground: {
      getAll: () =>
        $socket
          .request('profile/auth/getBackgroundList', {})
          .then(response => response.data)
    },
    authorizedSport: {
      get ({ ownerId, profileId }) {
        return ctx.$socket
          .request('sportsAuthorization/auth/getSportAuthorization', {
            ownerId,
            profileId
          })
          .then(res => res.data?.sports)
      },

      mutateCourses ({ ownerId, profileId, interestIds = [] }) {
        return ctx.$socket.request('sportsAuthorization/auth/addUpdateCourse', {
          ownerId,
          profileId,
          interestIds
        })
      },

      mutatePrivateLessons ({ ownerId, profileId, interestIds = [] }) {
        return ctx.$socket.request(
          'sportsAuthorization/auth/addUpdatePrivate',
          { ownerId, profileId, interestIds }
        )
      }
    },
    award: {
      mutate (award) {
        const payload = {
          ...award,
          end: +ctx.$dayjs(award.end).format('YYYYMMDD')
        }
        return ctx.$socket
          .request('payroll/auth/addUpdateAward', payload)
          .then(res => res.data?.awards?.[0])
      }
    },
    bio: {
      create (payload) {
        return request('createbio', payload, { module: 'bio' })
      },
      delete (payload) {
        return request('deletebio', payload, { module: 'bio' })
      },
      get (payload) {
        return request(
          'getbio',
          { profileId: payload },
          { module: 'bio' }
        ).then((res) => {
          return res.data
        })
      },
      update (payload) {
        return request('updatebio', payload, { module: 'bio' })
      }
    },
    company: {
      mutate (payload) {
        const endpoint = `company/auth/${
          payload._id ? 'updateCompany' : 'createCompany'
        }`
        return ctx.$socket
          .request(endpoint, detransformGym(payload))
          .then(res => res.success && transformGym(res.data))
      }
    },
    individual: {
      createProfile: payload =>
        $socket.request('company/auth/createProfile', payload),
      getGymRoles: ({ gymId, profileId }) =>
        $socket
          .request('relation/auth/getGymUserRole', { gymId, profileId })
          .then(response => response.data),
      getRelationships: profileId =>
        $socket
          .request('relation/auth/getNonGymProfiles', { profileId })
          .then(response => response.data),
      setInterest: (profileId, value) =>
        $socket.request('relation/auth/setIsInteresting', { profileId, value }),
      sendRegLink: profileId =>
        $socket
          .request('relation/auth/getNonGymProfiles', { profileId })
          .then(response => response.data)
    },
    payroll: {
      get ({ ownerId, profileId }) {
        return ctx.$socket
          .request('payroll/auth/payrollDetails', { ownerId, profileId })
          .then(res => res.data)
      },

      mutate (payroll) {
        return ctx.$socket
          .request('payroll/auth/addUpdatePayroll', payroll)
          .then(res => res.data)
      }
    },
    rooms: {
      create: payload =>
        $socket.request('rooms/auth/createRoom', payload, { module: 'rooms' }),
      get: () =>
        $socket
          .request('rooms/auth/getRoom', {})
          .then(response => response.data),
      update: payload => $socket.request('rooms/auth/updateRoom', payload)
    },
    settings: {
      setAppBackground: (profileId, backgroundId) =>
        $socket.request('profile/auth/setbackground', {
          profileId,
          backgroundId
        }),
      setLanguage: value =>
        $socket.request('profile/auth/setLanguage', { value }),
      setNotifications: payload =>
        $socket.request('profile/auth/setNotification', payload),
      setUnit: (unit, value) =>
        $socket.request(`profile/auth/set${unit}Format`, { value })
    },

    // Self
    getManagedProfileList () {
      return request('getProfileList', {}, { module: 'relation' }).then(
        res =>
          res?.data?.map?.((profile) => {
            const isBusiness = profile.isBusiness !== false
            return Object.assign(
              { isBusiness },
              isBusiness ? profile : transformPerson(profile)
            )
          }) || []
      )
    },

    switchProfile (profileId) {
      return request('activateRole', { profileId }, { module: 'profile' })
    },

    getMyProfile () {
      return ctx.$pwa.isGymDevice
        ? ctx.$socket
          .request('device/auth/getUserInfoById', {
            id: ctx.$pwa.deviceInfo.gymId
          })
          .then(res => res.data)
        : ctx.$socket.request('profile/auth/detail', {}).then(res => res.data)
    },

    getProfileDetail (id) {
      return ctx.$socket
        .request('device/auth/getUserInfoById', { id })
        .then(res => res.data)
    },

    getCompanyDetail (companyId) {
      return request('getCompanyDetail', { companyId }).then(res =>
        transformGym(res.data)
      )
    },

    getRefCWProfile () {
      return request('refCWProfile', {}, { module: 'profile', service: 'auth' })
    },

    getUserTutors (profileId) {
      return ctx.$socket
        .request('relation/auth/getUserTutor', { profileId })
        .then(res => res.data || [])
    },

    // Dashboard

    getDashboardCard () {
      return request('getCards', {}, { module: 'card', service: 'dashboard' })
    },
    deleteCard (payload) {
      return request('deleteCard', payload, {
        module: 'card',
        service: 'dashboard'
      })
    },
    deleteCardMessage (payload) {
      return request('hideInDashboard', payload, {
        module: 'message',
        service: 'chat'
      })
    },

    // Company
    getProfileById (id) {
      return request('getProfileDetail', { id })
        .then(wsResponseHandler)
        .then((data) => {
          return ['IN', 'TU'].includes(data.typeCode)
            ? transformPerson(data)
            : transformGym(data)
        })
    },

    // Gym profile
    getGyms () {
      return request('getGymList', {}).then(res =>
        res.data ? res.data.filter(Boolean).map(transformGym) : []
      )
    },

    getGymById (_id) {
      return request('getGymById', { _id }).then(res => transformGym(res.data))
    },

    mutateGym (gym) {
      return request(
        gym._id ? 'updateGym' : 'createGym',
        detransformGym(gym)
      ).then(res => res.success && transformGym(res.data))
    },

    assignParentId ({ parentGymId, gymIds = [] }) {
      return ctx.$socket.request('company/auth/assignParentId', {
        parentGymId,
        gymIds
      })
    },

    removeGymParent (gymId) {
      return ctx.$socket.request('company/auth/removeGymParent', { gymId })
    },

    getCodiceAtecoSuggestions () {
      return ctx.$axios.$get('/it/codice_ateco.json')
    },

    mutateGymRole (role, gymId) {
      return request(
        role._id ? 'upadateGymRole' : 'addGymRole',
        {
          gymId,
          status: 'temporary',
          ...ctx.$utils.extract(
            role,
            [
              'role',
              { from: 'id', to: 'userId' },
              {
                from: 'startAt',
                transform: d => (d ? +ctx.$dayjs(d).format('YYYYMMDD') : null)
              },
              {
                from: 'endAt',
                transform: d => (d ? +ctx.$dayjs(d).format('YYYYMMDD') : null)
              }
            ],
            { ignoreNull: true }
          )
        },
        { module: 'relation' }
      ).then(res => ({
        profile: role.profile,
        ...transformRelationRole(res.data, 'DI')
      }))
    },

    removeGymRole (relation, gymId) {
      return ctx.$socket.request('relation/auth/deleteGymRole', {
        gymId,
        userId: relation.id,
        role: relation.role
      })
    },

    mutateTutor (role, userId) {
      return ctx.$socket.request('relation/auth/addTutor', {
        tutorId: role.id,
        userId
      })
    },

    removeTutor (role, userId) {
      return ctx.$socket.request('relation/auth/removeTutor', {
        tutorId: role.id,
        userId
      })
    },

    reactivateGym (_id) {
      return request('reactivateGym', { _id })
    },

    removeGym (_id) {
      return request('deleteGymById', { _id })
    },

    changeCompanyStatus (id, status) {
      return request('changeCompanyStatus', { id, status }).then(
        res => !!res.data
      )
    },

    searchCompaniesByName (name) {
      return request('searchCompanyByName', { company: name }).then(
        res =>
          res.data?.map?.(g =>
            ctx.$utils.extract(g, [
              '_id',
              { from: 'company', to: 'displayName', transform: c => c.name },
              { from: 'company', to: 'typeCode', transform: c => c.typeCode },
              {
                from: 'ids',
                to: 'vat',
                transform: ids => ids?.find?.(id => id.key === 'vat')
              }
            ])
          ) || []
      )
    },

    searchCompaniesByVat (vat) {
      return request('vatSearch', {
        id: vat.value,
        countryCode: vat.countryCode
      }).then(res => (res.data ? res.data.map(transformGym) : []))
    },

    getCompanyByVat ({ value, countryCode }) {
      return request('vatGetDetail', { id: value, countryCode })
        .then(
          res => res?.data?._id && request('getGymById', { _id: res.data._id })
        )
        .then(res => transformGym(res?.data))
    },

    getCompanyByFiscal ({ value, countryCode }) {
      return request('fiscalGetDetail', { id: value, countryCode })
        .then(
          res => res?.data?._id && request('getGymById', { _id: res.data._id })
        )
        .then(res => transformGym(res?.data))
    },

    // Bank
    mutateBank (bank, parentId) {
      return request(bank._id ? 'bankEdit' : 'bankAdd', {
        forId: parentId,
        details: ctx.$utils.extract(
          bank,
          [
            { from: '_id', to: 'id' },
            { from: 'isActive', default: true },
            'name',
            'countryCode',
            'iban',
            'bic',
            'routingNumber',
            'account'
          ],
          { ignoreNull: true }
        )
      }).then(res => res.data)
    },

    removeBank (id, parentId) {
      return request('bankDelete', {
        forId: parentId,
        id
      })
    },

    // Validation
    checkEmailValidity (email) {
      return (
        !email ||
        useCache('checkEmailValidity', email, () => {
          return ctx.$axios
            .$get(`/api/auth/profile/validate/email/${email}`, { toast: false })
            .then((res) => {
              const valid = !(res.message || '')
                .toLowerCase()
                .includes('invalid email id')
              cache['checkEmailUniqueness:' + email] =
                !valid || res.data === true
              return valid
            })
        })
      )
    },

    checkEmailUniqueness (email) {
      return (
        !email ||
        useCache('checkEmailUniqueness', email, () => {
          return ctx.$axios
            .$get(`/api/auth/profile/validate/email/${email}`, { toast: false })
            .then((res) => {
              const valid = !(res.message || '')
                .toLowerCase()
                .includes('invalid email id')
              cache['checkEmailValidity:' + email] = valid
              return !valid || res.data === true
            })
        })
      )
    },

    checkMobileUniqueness (mobile) {
      return (
        !mobile ||
        !mobile.countryCode ||
        !mobile.phoneNumber ||
        useCache(
          'checkMobileUniqueness',
          mobile.countryCode + ':' + mobile.phoneNumber,
          () => {
            return ctx.$axios
              .$post('/api/auth/profile/validate/mobile', mobile, {
                toast: false
              })
              .then(res => res.data === true)
          }
        )
      )
    },

    checkChatEmailUniqueness (email) {
      return (
        !email ||
        useCache('checkChatEmailUniqueness', email, () => {
          return request('validInChatAlias', { text: email }).then(
            res => res.data === true
          )
        })
      )
    },

    checkFiscalUniqueness ({ countryCode, value: id }) {
      return useCache('validateFiscalId', countryCode + id, () => {
        return request('fiscalValidation', { countryCode, id }).then(
          res => res.data === true
        )
      })
    },

    checkVatUniqueness ({ countryCode, value: id }) {
      return useCache('validateVatId', countryCode + id, () => {
        return request('vatValidation', { countryCode, id }).then(
          res => res.data === true
        )
      })
    },

    contactSupport ({ message }) {
      // TODO
      return true
    },

    searchProfiles (text) {
      return request('searchUser', { text }).then(
        res =>
          res.data
            ?.map(p => ({ displayName: p.displayName, _id: p._id }))
            .filter(Boolean) || []
      )
    },

    // Individual profile
    getQrCodeForProfile (profileId) {
      return request('getQrCodeForProfile', profileId ? { profileId } : {}, {
        module: 'profile'
      }).then(res => res.success && JSON.stringify(res.data))
    },

    searchUserProfiles (text) {
      return request('searchUser', { text }).then(res =>
        res.data ? res.data.map(p => transformPerson(p)).filter(Boolean) : []
      )
    },

    getUserDetail (userId) {
      const request = ctx.$pwa.isStandalone
        ? ctx.$socket.request('device/auth/getUserInfoById', { id: userId })
        : ctx.$socket.request('company/auth/getUserDetail', { userId })

      return request.then(res => transformPerson(res.data))
    },

    getProfileByEmail (email) {
      const request = ctx.$pwa.isStandalone
        ? ctx.$socket.request('device/auth/emailSearch', { emailId: email })
        : ctx.$socket.request('company/auth/userGetDetailByEmail', {
          id: email
        })
      return request.then(res => res.data?._id && repos.getUserDetail(res.data._id))
    },

    getProfileByMobile (mobile) {
      const { countryCode, prefixNumber, phoneNumber } = mobile || {}
      if (countryCode && phoneNumber && prefixNumber) {
        const endpoint = ctx.$pwa.isStandalone
          ? 'device/auth/phoneSearch'
          : 'company/auth/userGetDetailByMobile'

        return ctx.$socket
          .request(endpoint, {
            countryCode,
            prefix: prefixNumber,
            phoneNo: phoneNumber
          })
          .then(res => res.data?._id && repos.getUserDetail(res.data._id))
      }
    },

    getProfileByPin (pin) {
      const { countryCode, value } = pin || {}
      return (
        countryCode &&
        value &&
        request('userGetDetailByPin', { countryCode, id: value })
          .then(res => res.data?._id && repos.getUserDetail(res.data._id))
      )
    },

    getProfileByTin (tin) {
      const { countryCode, value } = tin || {}
      return (
        countryCode &&
        value &&
        request('userGetDetailByTin', { countryCode, id: value })
          .then(res => res.data?._id && repos.getUserDetail(res.data._id))
      )
    },

    mutateProfile (profile) {
      const endpoint = ctx.$pwa.isStandalone
        ? `device/auth/${profile._id ? 'updateProfile' : 'registerProfile'}`
        : `company/auth/${profile._id ? 'updateProfile' : 'createProfile'}`

      return ctx.$socket
        .request(endpoint, detransformProfile(profile))
        .then(res => transformPerson(res.data))
    },

    transformGym,
    transformPerson
  }

  function request (
    action,
    payload,
    { module = 'company', service = 'auth' } = {}
  ) {
    return ctx.$socket.sendAndRead({
      module,
      service,
      action,
      payload
    })
  }

  // Detransform gym before sending to API
  function detransformGym (raw) {
    const gym = ctx.$utils.extract(
      raw,
      [
        '_id',
        'typeCode',
        'parentId',
        'shortDescription',
        'notes',
        'status',
        'paymentTermId',
        {
          from: 'managedCountries',
          transform: countries =>
            countries?.map?.(c => ({ countryCode: c })) || []
        },
        { from: 'cwSalesman', transform: c => c?._id }
      ],
      { ignoreNull: true }
    )

    if (raw?.avatar?.file) {
      gym.avatar = {
        filename: raw.avatar.file.name,
        base64: raw.avatar.src.replace(/^data:image\/(png|jpeg);base64,/, '')
      }
    }

    if (raw?.vat || raw?.fiscal) {
      gym.ids = []
      raw?.vat?.countryCode &&
        raw.vat.value &&
        gym.ids.push({ ...raw.vat, key: 'vat' })
      raw?.fiscal?.countryCode &&
        raw.fiscal.value &&
        gym.ids.push({ ...raw.fiscal, key: 'fiscal' })
    }

    gym.company = ctx.$utils.extract(
      raw,
      [
        'name',
        'pec',
        'brand',
        'sdi',
        'vatRateId',
        {
          from: 'cwModules',
          transform: cwModules =>
            cwModules.map(m =>
              ctx.$utils.extract(
                m,
                [
                  'area',
                  'isActive',
                  'paidByGroup',
                  'contactsCount',
                  {
                    from: 'discounts',
                    transform: discounts =>
                      discounts.map(d =>
                        ctx.$utils.extract(
                          d,
                          [
                            'discount',
                            {
                              from: 'start',
                              to: 'startDt',
                              transform: d =>
                                d ? +ctx.$dayjs(d).format('YYYYMMDD') : null
                            },
                            {
                              from: 'end',
                              to: 'endDt',
                              transform: d =>
                                d ? +ctx.$dayjs(d).format('YYYYMMDD') : null
                            }
                          ],
                          { ignoreNull: true }
                        )
                      )
                  }
                ],
                { ignoreNull: true }
              )
            )
        },
        {
          from: 'credits',
          transform: credits =>
            credits
              .filter(c => c.credit)
              .map(c =>
                ctx.$utils.extract(
                  c,
                  [
                    'credit',
                    {
                      from: 'start',
                      to: 'startDt',
                      transform: d =>
                        d ? +ctx.$dayjs(d).format('YYYYMMDD') : null
                    },
                    {
                      from: 'end',
                      to: 'endDt',
                      transform: d =>
                        d ? +ctx.$dayjs(d).format('YYYYMMDD') : null
                    }
                  ],
                  { ignoreNull: true }
                )
              )
        },
        {
          from: 'balanceStartDate',
          to: 'balanceSheet',
          transform: d => ({ startDate: +ctx.$dayjs(d).format('YYYYMMDD') })
        },
        {
          from: 'emails',
          default: [],
          transform: emails =>
            emails && emails.filter(Boolean).map(email => ({ email }))
        },
        {
          from: 'mobiles',
          to: 'mobilePhones',
          default: [],
          transform: mobiles =>
            mobiles.filter(m => m.countryCode && m.phoneNumber)
        },
        {
          from: 'landlines',
          default: [],
          transform: landlines =>
            landlines.filter(l => l.countryCode && l.phoneNumber)
        },
        {
          from: 'onlineLinks',
          default: [],
          transform: links => links.filter(l => l.link)
        },
        { from: 'mailInChat', transform: alias => ({ alias }) }
      ],
      { ignoreNull: true }
    )

    // To add new bank, referent and director need to call explicit api
    if (!gym._id && raw?.banks?.length) {
      gym.company.banks = raw.banks.map((bank) => {
        return ctx.$utils.extract(
          bank,
          [
            '_id',
            'name',
            'countryCode',
            'iban',
            'bic',
            'routingNumber',
            'account'
          ],
          { ignoreNull: true }
        )
      })
    }

    if (!gym._id) {
      gym.company.roles = []

      if (raw.cwSalesman?._id) {
        gym.company.roles.push({
          role: 'SP',
          id: raw.cwSalesman._id,
          startAt: raw.cwSalesman.startAt || undefined,
          endAt: raw.cwSalesman.endAt || undefined
        })
      }

      if (raw?.directors?.length || raw?.referents?.length) {
        gym.company.roles.push(
          ...[]
            .concat(raw.directors)
            .concat(raw.referents)
            .filter(Boolean)
            .map(role =>
              ctx.$utils.extract(
                role,
                [
                  'role',
                  {
                    from: 'profile',
                    to: 'id',
                    transform: profile => profile._id
                  },
                  {
                    from: 'startAt',
                    transform: d => +ctx.$dayjs(d).format('YYYYMMDD')
                  },
                  {
                    from: 'endAt',
                    transform: d => +ctx.$dayjs(d).format('YYYYMMDD')
                  }
                ],
                { ignoreNull: true }
              )
            )
        )
      }

      if (!gym.company.roles.length) {
        delete gym.company.roles
      }
    }

    // business profile modal use "addresses", gym modal use "address" and "operativeAddresses"
    if (
      raw?.address ||
      raw?.operativeAddresses?.length ||
      raw?.addresses?.length
    ) {
      gym.company.addresses = []
        .concat(raw.address)
        .concat(raw.operativeAddresses)
        .concat(raw.addresses)
        .filter(a => a?.fulladdress)
    }

    if (
      raw?.address?.addressComponents?.country?.short?.toLowerCase?.() === 'it'
    ) {
      gym.company.countryFields = {
        it: ctx.$utils.extract(
          raw,
          [
            'companyType',
            {
              from: 'codiceAteco',
              transform: arr => arr?.filter?.(Boolean) || []
            },
            'taxRegime',
            { from: 'rea', transform: arr => arr?.filter?.(Boolean) || [] }
          ],
          { ignoreNull: true }
        )
      }
      const {
        rea,
        codiceAteco,
        companyType,
        taxRegime
      } = gym.company.countryFields.it
      if (!rea?.length && !codiceAteco?.length && !companyType && !taxRegime) {
        delete gym.company.countryFields
      }
    }

    if (raw?.chatPluginSettings) {
      gym.company.chatPluginSettings = raw.chatPluginSettings
    }

    gym.settings = {
      language:
        raw.settings?.language ||
        raw?.address?.addressComponents?.country?.short.toLowerCase() ||
        'en'
    }

    return gym
  }

  // Transform gym returned from API
  function transformGym (raw) {
    if (!raw || !raw._id) {
      return null
    }

    const gym = ctx.$utils.extract(raw.company, [
      'name',
      'banks',
      'chatPluginSettings',
      {
        from: 'credits',
        transform: credits =>
          credits.map(c =>
            ctx.$utils.extract(c, [
              'credit',
              {
                from: 'startDt',
                to: 'start',
                transform: d =>
                  d ? ctx.$dayjs(d + '', 'YYYYMMDD').toDate() : null
              },
              {
                from: 'endDt',
                to: 'end',
                transform: d =>
                  d ? ctx.$dayjs(d + '', 'YYYYMMDD').toDate() : null
              }
            ])
          )
      },
      { from: 'sdi', default: null },
      { from: 'brand', default: null },
      { from: 'mailInChat', transform: m => m.alias },
      {
        from: 'balanceSheet',
        to: 'balanceStartDate',
        default: null,
        transform: b =>
          b?.startDate
            ? ctx.$dayjs(b?.startDate + '', 'YYYYMMDD').toDate()
            : null
      },
      {
        from: 'addresses',
        to: 'address',
        default: null,
        transform: addresses => addresses.find(a => a.type === 'legal') || null
      },
      {
        from: 'addresses',
        to: 'operativeAddresses',
        default: [],
        transform: addresses =>
          (addresses || []).filter(a => a.type !== 'legal')
      },
      {
        from: 'pecs',
        to: 'pec',
        default: null,
        transform: pecs => (pecs && pecs[0] && pecs[0].pec) || null
      },
      {
        from: 'emails',
        default: [],
        transform: emails => emails.map(p => p.email)
      },
      { from: 'mobilePhones', to: 'mobiles', default: [] },
      { from: 'phones', to: 'landlines' },
      { from: 'onlineLinks', default: [] }
    ])

    if (raw.company?.countryFields?.it) {
      Object.assign(
        gym,
        ctx.$utils.extract(raw.company?.countryFields?.it, [
          { from: 'companyType', default: null },
          { from: 'codiceAteco', default: [] },
          { from: 'taxRegime', default: null },
          { from: 'rea', default: [] }
        ])
      )
    }

    Object.assign(
      gym,
      ctx.$utils.extract(raw, [
        '_id',
        'typeCode',
        'parentId',
        'displayName',
        { from: 'status', default: 'draft' },
        'shortDescription',
        'vatRateId',
        {
          from: 'managedCountries',
          transform: countries =>
            countries.map(c => c.countryCode?.toLowerCase())
        },
        'notes',
        'settings',
        {
          from: 'cwModules',
          default: [],
          transform: cwModules =>
            cwModules.map(m =>
              ctx.$utils.extract(m, [
                'area',
                'isActive',
                'paidByGroup',
                'contactsCount',
                { from: 'priceHistory', default: [] },
                {
                  from: 'discounts',
                  default: [],
                  transform: discounts =>
                    discounts.map(d =>
                      ctx.$utils.extract(d, [
                        'discount',
                        {
                          from: 'startDt',
                          to: 'start',
                          transform: d =>
                            d ? ctx.$dayjs(d + '', 'YYYYMMDD').toDate() : null
                        },
                        {
                          from: 'endDt',
                          to: 'end',
                          transform: d =>
                            d ? ctx.$dayjs(d + '', 'YYYYMMDD').toDate() : null
                        }
                      ])
                    )
                }
              ])
            )
        },
        { from: 'avatar' },
        {
          from: 'ids',
          to: 'vat',
          default: null,
          transform: ids =>
            Array.isArray(ids) && ids.find(id => id.key === 'vat')
        },
        {
          from: 'ids',
          to: 'fiscal',
          default: null,
          transform: ids =>
            Array.isArray(ids) && ids.find(id => id.key === 'fiscal')
        },
        {
          from: 'relations',
          to: 'directors',
          default: [],
          transform: relations => transformRoles(relations, 'DI')
        },
        {
          from: 'relations',
          to: 'referents',
          default: [],
          transform: relations => transformRoles(relations, 'RE')
        }
      ])
    )

    if (!gym.displayName) {
      gym.displayName = gym.brand || gym.name || ''
    }

    if (raw.groups?.child?.length || raw.groups?.parent?._id) {
      gym.groups = (raw.groups.child || [])
        .concat(raw.groups.parent)
        .filter(g => g?._id)
        .map(g =>
          ctx.$utils.extract(g, ['_id', 'displayName', 'typeCode', 'parentId'])
        )
    }

    return gym
  }

  function transformRoles (relations, roleId, multiple = true) {
    const roles = []
    for (const relation of relations) {
      const role = transformRelationRole(relation, roleId)
      const profile = role && transformPerson(relation.rightProfileId)
      if (profile) {
        const roleInfo = { profile, id: profile._id, ...role }
        if (multiple) {
          roles.push(roleInfo)
        } else {
          return roleInfo
        }
      }
    }
    return multiple ? roles : null
  }

  function transformRelationRole (relation, roleId) {
    const role = relation?.roles?.find(
      r => r.role === roleId && r.status !== 'suspended'
    )
    return (
      role &&
      ctx.$utils.extract(
        role,
        [
          '_id',
          'role',
          { from: 'startAt', transform: d => d && new Date(d) },
          { from: 'endAt', transform: d => d && new Date(d) }
        ],
        { ignoreNull: true }
      )
    )
  }

  function detransformProfile (raw) {
    const profile = ctx.$utils.extract(
      raw,
      [
        '_id',
        'shortDescription',
        { from: 'password', transform: p => window.btoa(p) },
        { from: 'typeCode', default: 'IN' },
        { from: 'sportInterests', to: 'interests' },
        {
          from: 'acquisitionChannel',
          transform: a =>
            ctx.$utils.extract(a, ['source', 'advType', 'friendId'], {
              ignoreNull: true
            })
        }
      ],
      { ignoreNull: true }
    )

    if (profile.interests?.length) {
      const interests = profile.interests.filter(p => p?.isNew)
      if (interests.length) {
        profile.suggestedInterest = interests.map(s => s.name)
        profile.interests = profile.interests.filter(p => !p?.isNew)
      }
    }

    if (raw?.avatar?.file) {
      profile.avatar = {
        filename: raw.avatar.file.name,
        base64: raw.avatar.src.replace(/^data:image\/(png|jpeg);base64,/, '')
      }
    }

    profile.ids = (raw.pins || [])
      .concat(raw.tins || [])
      .filter(id => id.key && id.countryCode && id.value)

    profile.person = ctx.$utils.extract(
      raw,
      [
        'firstname',
        'lastname',
        'gender',
        'banks',
        {
          from: 'emails',
          transform: emails => emails.filter(Boolean).map(email => ({ email }))
        },
        {
          from: 'mobiles',
          to: 'mobilePhones',
          transform: phones =>
            phones.filter(p => p.countryCode && p.phoneNumber)
        },
        {
          from: 'landlines',
          to: 'phones',
          transform: phones =>
            phones.filter(p => p.countryCode && p.phoneNumber)
        },
        {
          from: 'dob',
          to: 'birth',
          transform: date =>
            date && { date: +ctx.$dayjs(date).format('YYYYMMDD') }
        },
        {
          from: 'address',
          to: 'addresses',
          transform: addr => [addr].filter(a => a && a.fulladdress)
        },
        {
          from: 'onlineLinks',
          default: [],
          transform: links => links.filter(l => l.link)
        },
        {
          from: 'tutors',
          transform: tutors => tutors.map(t => t.id)
        }
      ],
      { ignoreNull: true }
    )

    if (raw.pob) {
      const [city, country] = raw.pob
        .split(', ')
        .map(t => t.trim())
        .filter(Boolean)
      city &&
        country &&
        Object.assign(profile.person, {
          birth: { ...profile.person.birth, city, country }
        })
    }

    profile.settings = {
      language:
        raw?.settings?.language ||
        raw?.address?.addressComponents?.country?.short.toLowerCase() ||
        'en'
    }

    return profile
  }

  function transformPerson (raw) {
    if (!raw || !raw._id) {
      return null
    }

    const profile = ctx.$utils.extract(raw.person, [
      'firstname',
      'lastname',
      'gender',
      'onlineLinks',
      'banks',
      { from: 'emails', transform: emails => emails.map(e => e.email) },
      { from: 'mobilePhones', to: 'mobiles' },
      { from: 'phones', to: 'landlines' },
      {
        from: 'addresses',
        to: 'address',
        transform: addrs => addrs[0] || null
      },
      {
        from: 'birth',
        to: 'dob',
        transform: (birth) => {
          const d = birth?.date
          return typeof d === 'string'
            ? d.includes('-')
              ? ctx.$dayjs(d, 'YYYY-MM-DD').toDate()
              : d.length === 8
                ? ctx.$dayjs(d, 'YYYYMMDD').toDate()
                : ctx.$dayjs(+d).toDate()
            : null
        }
      }
    ])

    Object.assign(
      profile,
      ctx.$utils.extract(raw, [
        '_id',
        'settings',
        'typeCode',
        'shortDescription',
        'displayName',
        'hasPassword',
        'acquisitionChannel',
        { from: 'interests', to: 'sportInterests' },
        { from: 'avatar' },
        {
          from: 'ids',
          to: 'pins',
          transform: ids =>
            Array.isArray(ids) && ids.filter(id => id.key === 'pin')
        },
        {
          from: 'ids',
          to: 'tins',
          transform: ids =>
            Array.isArray(ids) && ids.filter(id => id.key === 'tin')
        }
      ])
    )

    const { city, country } = raw.person.birth || {}
    if (country && city) {
      Object.assign(profile, { pob: city + ', ' + country })
    }

    return profile
  }

  return repos
}
