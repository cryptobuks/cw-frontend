import { wsResponseHandler } from '@/plugins/utils'
const cache = {}
const useCache = async (key, getValue, ttl = 60000) => {
  if (key in cache) {
    return cache[key]
  }
  cache[key] = await getValue()
  setTimeout(() => {
    delete cache[key]
  }, ttl)
  return cache[key]
}

export const docTypeToEntityMap = {
  privacy: 'privacyPolicy',
  term: 'termsAndConditions',
  role: 'roleDocuments'
}

export default (ctx) => {
  return {
    addSignedDocument ({
      ownerId,
      profileId,
      documentId,
      isMadatory,
      isAccepted
    }) {
      return ctx.$socket
        .request('contracts/auth/addSignedDocument', {
          ownerId,
          profileId,
          documentId,
          isMadatory,
          isAccepted
        })
        .then(wsResponseHandler)
    },
    createDocument ({
      ownerId,
      type,
      role,
      content,
      activatedAt,
      expiredAt,
      isDefaultDocument,
      referenceDoc
    }) {
      return ctx.$socket
        .request('contracts/auth/createDocument', {
          ownerId,
          type,
          role,
          content,
          activatedAt,
          expiredAt,
          isDefaultDocument,
          referenceDoc
        })
        .then(wsResponseHandler)
    },
    createGymModule (gymId, { area, isActive, paidByGroup, discount }) {
      return ctx.$socket.request('cwmodules/auth/createCWModuleByGymId', {
        gymId,
        modules: { area, isActive, paidByGroup, discount }
      })
    },
    deleteDocument (id) {
      return ctx.$socket
        .request('contracts/auth/removeDocument', { id })
        .then(wsResponseHandler)
    },
    async getAreasByDocType (documentType, gym) {
      const country = await this.getGymCountry(gym)

      const entityType = docTypeToEntityMap[documentType]

      if (!entityType || !country) {
        return
      }

      return ctx.$repos.settingsRepo[entityType].get(country._id).then(res =>
        res.data.areas.map(a => ({
          ...a,
          country,
          contract: res.data.contract
        }))
      )
    },
    getDocumentById (id, source) {
      const endpoint = `contracts/auth/${
        source ? 'getContractBySourceId' : 'findById'
      }`
      const payload = source ? { source, id } : { id }
      return ctx.$socket.request(endpoint, payload).then((res) => {
        return (
          res.success &&
          ctx.$utils.extract(res.data, ['_id', 'content', 'type', 'ownerId'])
        )
      })
    },
    getDocumentsByType ({ ownerId, role, type }) {
      return ctx.$socket
        .request('contracts/auth/getDocumentByType', { ownerId, role, type })
        .then(wsResponseHandler)
    },
    getDocumentsSignedByProfile ({ ownerId, profileId }) {
      return ctx.$socket
        .request('contracts/auth/getDocumentSignedByProfile', {
          ownerId,
          profileId
        })
        .then(wsResponseHandler)
    },
    getDocSignatures: documentId =>
      ctx.$socket
        .request('contracts/auth/getProfileWhoSignedDocument', { documentId })
        .then(wsResponseHandler),
    async getGymCountry (gym) {
      const countries = await ctx.$repos.settingsRepo.country
        .get()
        .then(wsResponseHandler)
        .then(data => data.countries)

      return countries.find(
        country =>
          country.code ===
          gym.address?.addressComponents.country.short.toLowerCase()
      )
    },
    async getGymPriceList (gym) {
      const country = await this.getGymCountry(gym)
      return ctx.$repos.settingsRepo.priceList.get(country._id).then(res =>
        res.data.areas.map(a => ({
          ...a,
          country,
          contract: res.data.contract
        }))
      )
    },
    getGymModules (gymId) {
      return ctx.$socket
        .request('cwmodules/auth/getCwModulesByGYMId', { gymId })
        .then(wsResponseHandler)
    },
    getPendingDocSignatures: documentId =>
      ctx.$socket
        .request('contracts/auth/getProfileWhoNotSignedDocument', {
          documentId
        })
        .then(wsResponseHandler),
    getProfileUnsignedDocuments (payload) {
      const transformedPayload = ctx.$utils.extract(
        payload,
        ['profileId', { from: 'ownerIds', default: [] }],
        { ignoreNull: true }
      )
      return useCache(JSON.stringify(transformedPayload), () =>
        ctx.$socket
          .request(
            'contracts/auth/getProfileUnsignedDocuments',
            transformedPayload,
            { timeout: 60000 }
          )
          .then(res => (res.success ? transformDocuments(res.data || {}) : []))
          .catch(() => [])
      )
    },
    getRegisterConditions (payload) {
      return ctx.$axios
        .$post(
          '/api/auth/profile/signDocuments',
          ctx.$utils.extract(payload, ['countryCode', 'invitedBy'])
        )
        .then(res => transformDocuments(res.data) || [])
    },
    updateDocument ({
      ownerId,
      id,
      content,
      activatedAt,
      expiredAt,
      isDefaultDocument,
      referenceDoc
    }) {
      return ctx.$socket
        .request('contracts/auth/updateDocument', {
          ownerId,
          id,
          content,
          activatedAt,
          expiredAt,
          isDefaultDocument,
          referenceDoc
        })
        .then(wsResponseHandler)
    },
    updateGymModule (id, { area, isActive, paidByGroup, discount }) {
      return ctx.$socket.request('cwmodules/auth/updateCWModuleById', {
        _id: id,
        modules: { area, isActive, paidByGroup, discount }
      })
    },

    acceptDocuments (rawPayload) {
      const payload = ctx.$utils.extract(
        rawPayload,
        ['profileId', 'deviceId', { from: 'signature', to: 'sign' }],
        { ignoreNull: true }
      )

      const documents =
        rawPayload?.documents?.map?.(doc => ({
          documentId: doc._id,
          isMandatory: true,
          isAccepted: true,
          ownerId: doc.ownerId,
          source: doc.source,
          ealierRejected: doc.ealierRejected,
          role: doc.role,
          onBehalf:
            doc.role === 'TT' || doc.role === 'RE' ? doc.profile._id : undefined
        })) || []

      if (documents.length) {
        payload.reAccepted = documents.filter(d => d.ealierRejected)
        payload.documents =
          payload.reAccepted.length > 0
            ? documents.filter(d => !d.ealierRejected)
            : documents
      }

      const endpoint =
        (ctx.$pwa.isGymDevice ? 'device' : 'profile') +
        '/auth/acceptAndActivateRelation'
      return ctx.$socket
        .request(endpoint, payload)
        .then(res => res.success && res.data)
    }
  }

  function transformDocuments ({
    documents = [],
    dependentData: { gyms = [], referent = [], tutored = [] } = {}
  }) {
    const output = {}

    for (const doc of documents) {
      if (!output[doc.type]) {
        output[doc.type] = {
          type: doc.type,
          items: []
        }
      }

      const isRole = doc.type === 'role'
      const newDocs =
        isRole && doc.role === 'TT'
          ? tutored.map(profile => Object.assign(doc, { profile }))
          : isRole && doc.role === 'RE'
            ? referent.map(profile => Object.assign(doc, { profile }))
            : [
              Object.assign(doc, {
                profile: gyms.find(g => g._id === doc.ownerId)
              })
            ]

      output[doc.type].items.push(...newDocs)
    }

    const personatingDoc = output.role?.items?.find?.(
      item => item.role === 'PER'
    )
    const sourceDoc =
      personatingDoc &&
      output.role.items.find(item => item !== personatingDoc && item.ownerId)
    if (personatingDoc && sourceDoc) {
      personatingDoc.profile = sourceDoc.profile
      personatingDoc.ownerId = sourceDoc.ownerId
    }

    const individualTypeCodes = ['IN', 'TU']

    const arr = Object.values(output)
    for (const item of arr) {
      for (const doc of item.items) {
        doc.uniqueId = doc.type + ':' + doc.source + ':' + doc._id

        if (doc.profile) {
          const isIndividual = individualTypeCodes.includes(
            doc.profile.typeCode
          )
          const profile = isIndividual
            ? ctx.$repos.profileRepo.transformPerson(doc.profile)
            : ctx.$repos.profileRepo.transformGym(doc.profile)
          if (!isIndividual) {
            profile.directors = doc.profile.directors || []
          }
          doc.profile = profile
          doc.uniqueId += ':' + profile._id
        }
      }
    }

    return arr
  }
}
