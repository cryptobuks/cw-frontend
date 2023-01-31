<template>
  <div ref="container" class="pt-4 text-left">
    <template v-for="item in roleDeclarations">
      <base-checkbox
        :key="item.uniqueId"
        v-model="acceptedDocuments"
        v-bind="inputAttrs"
        :value="item.uniqueId"
        :disabled="!!missingTutoredFieldsById[item.profile._id]"
        square
        disable-label
        class="mb-6"
      >
        {{ $t('input.documents.i_accept_the') }}

        <span
          class="underline cursor-pointer"
          @click="viewDocuments(item)"
        >{{ $t('roles.' + item.role) }}  {{ $t('input.documents.declaration') }}</span>

        {{ $t('global.for') }}

        {{ item.profile.displayName }}
      </base-checkbox>

      <div
        v-if="missingTutoredFieldsById[item.profile._id]"
        :key="'_' + item.uniqueId"
        class="text-cw-red text-center leading-none -mt-4 mb-6"
        style="font-size: 15px;"
      >
        {{
          $t('input.documents.missing_fields_before', {
            name: item.profile.displayName,
            fields: missingTutoredFieldsById[item.profile._id].join(', ')
          })
        }}

        <span
          class="text-white underline cursor-pointer uppercase"
          @click="completeTutoredProfile(item)"
        >
          {{ $t("global.here") }}
        </span>

        {{ $t('input.documents.missing_fields_after') }}
      </div>
    </template>

    <individual-profile-modal v-if="Object.values(missingTutoredFieldsById).some(Boolean)" ref="tutoredModal">
      <template #top>
        <div class="text-center mb-6">
          {{ $t('profile_complete.headline.default') }}
        </div>
      </template>
    </individual-profile-modal>

    <div v-if="terms && terms.length" class="mb-6">
      <base-checkbox
        v-bind="inputAttrs"
        :checked="acceptedDocuments"
        :value="terms.map(term => term.uniqueId)"
        square
        @change="acceptedDocuments = $event"
      >
        {{ $t('input.documents.i_agree_to_the') }}

        <span
          class="underline cursor-pointer"
          @click.stop="viewDocuments(terms)"
        >{{ $t('input.documents.terms_n_conditions') }}</span>
      </base-checkbox>

      <base-validation-error
        v-if="cowellnessTerms.length > 0"
        ref="termValidation"
        :rules="{
          required: () => cowellnessTerms.every(c => value.includes(c)) || $t('validation.required')
        }"
        class="-mb-1"
      />
    </div>

    <div v-if="privacyPolicies && privacyPolicies.length" class="mb-6">
      <base-checkbox
        v-bind="inputAttrs"
        :checked="acceptedDocuments"
        :value="privacyPolicies.map(p => p.uniqueId)"
        square
        @change="acceptedDocuments = $event"
      >
        {{ $t('input.documents.i_accept_the') }}

        <span
          class="underline cursor-pointer"
          @click.stop="viewDocuments(privacyPolicies)"
        >{{ $t('input.documents.privacy_policy') }}</span>

        {{ $t('global.and') }}

        <span
          class="underline cursor-pointer"
          @click.stop="toggleDataPolicies"
        >{{ $t('input.documents.data_use') }}</span>
      </base-checkbox>

      <base-validation-error
        v-if="cowellnessPrivacyPolicies.length > 0"
        ref="privacyValidation"
        :rules="{
          required: () => cowellnessPrivacyPolicies.every(c => value.includes(c)) || $t('validation.required')
        }"
        class="-mb-1"
      />

      <div v-show="dataPoliciesShown" ref="policies" class="pl-8 mt-2">
        <base-checkbox
          v-for="(text, i) in dataUsePolicies"
          :key="i"
          :checked="acceptedDataPolicies"
          v-bind="inputAttrs"
          :value="i + ''"
          class="mt-4 text-sm"
          square
          @change="changeAcceptedDataPolicies"
        >
          {{ text }}
        </base-checkbox>
      </div>
    </div>

    <cw-contracts-detail-modal
      ref="detailModal"
      v-model="acceptedDocuments"
      :personating-doc="personatingDoc"
    />
  </div>
</template>

<script>
export default {
  components: {
    IndividualProfileModal: () => import('~/components/entities/profile/IndividualProfileModal')
  },
  inheritAttrs: false,
  props: {
    value: { type: Array, default: () => [] },
    gymId: { type: String, default: '' },
    profile: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      documents: [],
      dataPoliciesShown: false,
      acceptedDataPolicies: [],
      promise: null,
      // Map with individual profile modal fields (after transform)
      individualFieldsMap: Object.freeze({
        name: 'firstname',
        surname: 'lastname',
        address: 'address',
        email: 'emails',
        'place-of-birth': 'pob',
        'date-of-birth': 'dob',
        'personal-identification-number': 'pin',
        'personal-tax-number': 'tin',
        'mobile-phone': 'mobiles',
        'landline-phone': 'landlines'
      }),
      missingTutoredFieldsById: {},
      debounce: this.$utils.createDebounce()
    }
  },
  computed: {
    // Unique id generatedb by contractRepo in the form of {doc.type}:{doc.source}:{doc._id}:{doc.profile._id}
    documentsByUniqueId () {
      const docs = {}
      for (const doc of this.documents) {
        for (const item of doc.items) {
          docs[item.uniqueId] = item
        }
      }
      return docs
    },

    acceptedDocuments: {
      get () {
        return this.value.map(v => v.uniqueId)
      },

      set (uniqueIds) {
        const oldPrivacyCount = this.value.filter(d => d.type === 'privacy').length
        const newPrivacyCount = uniqueIds.filter(id => id.startsWith('privacy')).length
        const oldTermCount = this.value.filter(d => d.type === 'term').length
        const newTermCount = uniqueIds.filter(id => id.startsWith('term')).length
        if (!!oldPrivacyCount !== !!newPrivacyCount) {
          this.acceptedDataPolicies = newPrivacyCount ? this.dataUsePolicies.map((_, i) => i + '') : []
        }
        if (oldPrivacyCount !== newPrivacyCount) {
          setTimeout(() => this.$refs.privacyValidation?.validate(), 100)
        }
        if (oldTermCount !== newTermCount) {
          setTimeout(() => this.$refs.termValidation?.validate(), 100)
        }
        const newValue = uniqueIds.map(id => this.documentsByUniqueId[id])

        if (this.personatingDoc) {
          const hasRoleDoc = newValue.some(d => d.type === 'role' && d !== this.personatingDoc)
          const hasPersonatingDoc = newValue.includes(this.personatingDoc)
          if (hasRoleDoc && !hasPersonatingDoc) {
            newValue.push(this.personatingDoc)
          } else if (!hasRoleDoc && hasPersonatingDoc) {
            newValue.splice(newValue.indexOf(this.personatingDoc), 1)
          }
        }
        if (this.flagsCount === newValue.length) {
          this.$attrs.listeners?.validated()
        }

        this.$emit('input', newValue)

        this.updateRequiredFields(newValue)
      }
    },

    dataUsePolicies () {
      if (!this.privacyPolicies) {
        return []
      }

      const countries = Array.from(
        new Set(
          this.privacyPolicies.map(
            item => item.profile.company?.address?.addressComponent?.country?.long || 'Italy'
          )
        )
      ).join(', ')
      const gyms = Array.from(
        new Set(
          this.privacyPolicies.map(item => item.profile.displayName)
        )
      ).filter(Boolean).join(' and ') || countries

      return !gyms ? [] : [
        this.$t('contract.privacy_consent_1', { gyms }),
        this.$t('contract.privacy_consent_2', { gyms }),
        this.$t('contract.privacy_consent_3', { gyms })
      ]
    },

    inputAttrs () {
      return this.$utils.extract(this.$attrs, ['active', 'inactive'])
    },

    privacyPolicies () {
      return this.documents.find(d => d.type === 'privacy')?.items
    },

    cowellnessPrivacyPolicies () {
      return this.privacyPolicies?.filter(p => this.$auth.isCW(p?.profile?.typeCode)) || []
    },

    terms () {
      return this.documents.find(d => d.type === 'term')?.items
    },

    cowellnessTerms () {
      return this.terms.filter(t => this.$auth.isCW(t.profile?.typeCode)) || []
    },

    roleDeclarations () {
      return this.documents.find(d => d.type === 'role')?.items?.filter(d => d?.role !== 'PER')
    },

    personatingDoc () {
      return this.documents.find(d => d.type === 'role')?.items?.find?.(d => d?.role === 'PER')
    },

    cwContracts () {
      return this.documents.find(d => d.type === 'contract')?.items
    },

    flagsCount () {
      return (this.privacyPolicies?.length || 0) +
        (this.terms?.length || 0) +
        (this.roleDeclarations?.length || 0) +
        (this.personatingDoc ? 1 : 0) +
        (this.cwContracts?.length || 0)
    },

    requiredDynamicFieldsByDocId () {
      if (!this.roleDeclarations) {
        return {}
      }
      const output = {}
      for (const item of this.roleDeclarations) {
        if (output[item._id]) {
          continue
        }

        const outputItem = output[item._id] = {
          source: [],
          destination: []
        }

        if (item.content?.includes('data-field="')) {
          const el = document.createElement('div')
          el.innerHTML = item.intro + item.content
          const fields = Array.from(el.querySelectorAll('[data-field]'))
          for (const field of fields) {
            const f = field.getAttribute('data-field')
            if (f.startsWith('source.')) {
              outputItem.source.push(f.replace('source.', ''))
            } else if (f.startsWith('destination.')) {
              outputItem.destination.push(f.replace('destination.', ''))
            }
          }
        }
      }
      return output
    }
  },
  watch: {
    gymId: 'getDocuments',
    profile: 'getDocuments'
  },
  created () {
    this.getDocuments()
  },
  mounted () {
    if (this.roleDeclarations?.length) {
      for (const doc of this.roleDeclarations) {
        this.resetMissingFields(doc)
      }
    }

    this.checkValidation()
  },
  beforeDestroy () {
    this.$attrs.listeners?.validated?.()
    this.$emit('validated')
  },
  methods: {
    getDocuments () {
      this.debounce(async () => {
        if (!this.$auth.isAuthenticated) {
          const payload = {
            countryCode: await this.$repos.countryRepo.getMyCountryCode()
          }
          const invitingId = this.$route.query.invitingId
          if (invitingId) {
            payload.invitedBy = invitingId
          }

          this.documents = await this.$repos.contractsRepo.getRegisterConditions(payload)
        } else {
          this.promise = this.$repos.contractsRepo.getProfileUnsignedDocuments({
            ownerIds: [this.gymId].filter(Boolean),
            profileId: this.profile?._id || undefined
          }).then((res) => {
            this.promise = null
            return res
          })

          this.documents = await this.promise
        }

        if (!this.documents.length) {
          this.$emit('empty')
        }
      })
    },

    resetMissingFields (doc) {
      if (doc.role !== 'TT' || !doc.content.includes('data-field="destination.')) {
        return
      }

      const fields = []
      const extractedData = this.$refs.detailModal.extractIndividualInfo(doc.profile)
      for (const field of Object.keys(this.individualFieldsMap)) {
        if (!extractedData[field] && doc.content.includes(`data-field="destination.${field}"`)) {
          fields.push(field.split('-').join(' '))
        }
      }
      if (fields.length) {
        this.missingTutoredFieldsById[doc.profile._id] = fields
      }
    },

    changeAcceptedDataPolicies (policies) {
      this.acceptedDataPolicies = policies

      const isPrivacyAccepted = this.value.some(d => d.type === 'privacy')
      if (policies.length < this.dataUsePolicies.length) {
        if (isPrivacyAccepted) {
          this.$emit('input', this.value.filter(d => d.type !== 'privacy'))
          setTimeout(() => this.$refs.privacyValidation?.validate(), 100)
        }
      } else if (!isPrivacyAccepted) {
        this.$emit('input', this.value.concat(this.documents.find(d => d.type === 'privacy')?.items || []))
        setTimeout(() => this.$refs.privacyValidation?.validate(), 100)
      }
    },

    viewDocuments (docs) {
      this.$refs.detailModal.show(
        docs,
        docs.role === 'TT'
          ? { destination: docs.profile, source: this.profile }
          : { destination: this.profile })
    },

    async checkValidation () {
      this.promise && await this.promise

      if (!this.documents.length || this.value.length === this.documents.length) {
        this.$attrs.listeners?.validated?.()
        this.$emit('validated')
      }
    },

    toggleDataPolicies () {
      this.dataPoliciesShown = !this.dataPoliciesShown
      this.$nextTick(() => {
        const ref = this.$refs.policies
        const lastChild = ref && ref.children[ref.childElementCount - 1]
        if (lastChild) {
          lastChild.scrollIntoView()
        }
      })
    },

    updateRequiredFields (docs) {
      const requiredFields = []
      const detectedDocIds = []
      for (const doc of docs) {
        if (detectedDocIds.includes(doc._id)) {
          continue
        }
        const isSource = doc.role === 'TT'
        const fields = isSource
          ? this.requiredDynamicFieldsByDocId[doc._id]?.source || []
          : this.requiredDynamicFieldsByDocId[doc._id]?.destination || []
        requiredFields.push(...fields.map(f => this.individualFieldsMap[f]))
        detectedDocIds.push(doc._id)
      }

      this.$emit('required-fields-change', Array.from(new Set(requiredFields)))
    },

    async completeTutoredProfile (doc) {
      const detail = await this.$repos.profileRepo.getUserDetail(doc.profile._id)
      this.$refs.tutoredModal.show(detail, {
        requiredFields: this.missingTutoredFieldsById[doc.profile._id]
          .map(f => this.individualFieldsMap[f]),
        onDone: (newProfile) => {
          this.missingTutoredFieldsById = { ...this.missingTutoredFieldsById, [doc.profile._id]: null }
          doc.profile = newProfile
        }
      })
    }
  }
}
</script>
