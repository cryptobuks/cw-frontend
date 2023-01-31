const SET_CERTIFICATES = 'setCertificates'

export const state = () => ({
  certificates: []
})

export const mutations = {
  [SET_CERTIFICATES]: (state, certificates) =>
    (state.certificates = certificates)
}

export const actions = {
  async getCertificates ({ commit }, { gymId, profileId }) {
    let certificates = await this.$repos.certificatesRepo.get(gymId, profileId)
    certificates = certificates
      .sort((a, b) => b.expiry - a.expiry)
      .map((certificate) => {
        const expired =
          this.$utils.digitToDate(certificate.expiry) < new Date()
        return {
          ...certificate,
          approvals: certificate.owners.filter(owner => owner.isApproved),
          approved:
            !!certificate.owners.find(
              owner => owner.ownerId === this.$auth.user._id && owner.isApproved
            ) ||
            (certificate.type === 'identity' && !expired) ||
            false,
          dates: { expiry: this.$utils.digitToDate(certificate.expiry) },
          expired
        }
      })

    commit(SET_CERTIFICATES, certificates)
  }
}

export const getters = {
  certificateTypes: ({ certificates }) => (type) => {
    const certTypes = {
      medical: {
        certificates: [],
        active: null
      },
      identity: {
        certificates: [],
        active: null
      },
      enable: { certificates: [], status: 'active' },
      curriculum: {
        certificates: [],
        active: null
      }
    }

    for (const certificate of certificates) {
      const certType = certTypes[certificate.type]
      const progressive = certType?.certificates.length + 1
      certType?.certificates.push({
        ...certificate,
        progressive
      })
    }

    Object.keys(certTypes).forEach((key) => {
      const certType = certTypes[key]
      certType.activeCertificate =
        certType.certificates.filter(c => c.approvals.length > 0)[0] ||
        certType.certificates[0] // latest with approval or just the latest
      certType.status =
        !certType.activeCertificate?.approved ||
        certType.activeCertificate?.expired
          ? 'pending'
          : 'active'
      certType.pendingCertificate = !certType.certificates[0]?.approved
        ? certType.certificates[0]
        : undefined
    })

    return type ? certTypes[type]?.certificates : certTypes
  }
}
