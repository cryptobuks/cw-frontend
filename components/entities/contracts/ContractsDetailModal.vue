<template>
  <base-modal
    ref="modal"
    :title="$t('contract.type.' + type)"
    body-class="cw-contracts-detail"
  >
    <template v-if="roleDeclaration">
      <cw-editor-text-viewer
        :value="getDocumentContent(roleDeclaration)"
        :dynamic-entities="getDynamicFields(roleDeclaration)"
        class="text-justify"
      />

      <cw-editor-text-viewer
        v-if="personatingDoc"
        :value="personatingDoc.content"
        :dynamic-entities="getDynamicFields(personatingDoc)"
        class="text-justify mt-12"
      />
    </template>

    <template v-else>
      <section>
        <p class="mb-4">
          {{ $t('contracts_modal.greeting.' + type) }}
        </p>

        <div
          v-for="(contract, i) in contracts"
          :key="contract.uniqueId"
          class="mt-3 pl-5"
        >
          <div class="flex">
            <base-checkbox
              :checked="value"
              :value="contract.uniqueId"
              square
              class="flex-shrink-0 inline-flex ml-1 text-white"
              @change="changeValue($event, contract)"
            >
              <span class="underline cursor-pointer" @click.stop="scrollToContract(contract)">
                {{ contract.profile.displayName }}
              </span>
            </base-checkbox>

            <base-icon
              v-if="contract.type === 'privacy'"
              :name="policiesShown[i] ? 'chevron-up' : 'chevron-down'"
              class="ml-3 mt-1 cursor-pointer"
              @click="policiesShown.splice(i, 1, !policiesShown[i])"
            />
          </div>

          <div v-if="policiesShown[i]" class="mt-1 pl-15">
            <base-checkbox
              v-for="(text, j) in getDataUsePolicies(contract)"
              :key="`${i}_${j}`"
              :checked="selectedPolicies[contract.uniqueId].includes(j)"
              :label="text"
              square
              class="mt-4 text-xs"
              @change="togglePolicies(contract.uniqueId, j)"
            />
          </div>
        </div>
      </section>

      <section
        v-for="contract in contracts"
        :key="contract.uniqueId"
        :ref="`contract:${contract.uniqueId}`"
        class="text-justify"
      >
        <h4 class="text-center font-semibold mb-4">
          {{ contract.profile.displayName }} - {{ $t('contract.type.' + contract.type) }}
        </h4>

        <cw-editor-text-viewer
          :value="getDocumentContent(contract)"
          :dynamic-entities="getDynamicFields(contract)"
        />
      </section>
    </template>
  </base-modal>
</template>

<script>
export default {
  props: {
    value: { type: Array, default: () => [] },
    personatingDoc: { type: Object, default: null }
  },
  data () {
    return {
      contracts: [],
      destination: null,
      source: null,
      policiesShown: [],
      selectedPolicies: {}
    }
  },
  computed: {
    type () {
      return this.contracts[0]?.type
    },
    roleDeclaration () {
      return this.contracts.find(c => c.type === 'role')
    },
    dynamicDataByProfileId () {
      const output = {}
      const profiles = [this.source, this.destination].filter(Boolean)

      if (!this.source) {
        profiles.push(...this.contracts
          .filter(c => c.profile && (c.content?.includes('data-field=') || (c.intro?.includes('data-field='))))
          .map(c => c.profile))
      }

      for (const profile of profiles) {
        if (!output[profile._id]) {
          output[profile._id] = this.extractProfileInfo(profile)
        }
      }

      return output
    }
  },
  methods: {
    show (contracts, opts) {
      this.contracts = [].concat(contracts).filter(Boolean)
      this.toggleStates = Array.from({ length: this.contracts.length }).fill(false)
      this.destination = opts?.destination
      this.source = opts?.source

      const selectedPolicies = {}
      const policiesShown = []
      for (const c of this.contracts) {
        if (c.type === 'privacy') {
          policiesShown.push(false)
          selectedPolicies[c.uniqueId] = this.value.includes(c.uniqueId) ? [0, 1, 2] : []
        }
      }
      this.selectedPolicies = selectedPolicies
      this.policiesShown = policiesShown

      this.$refs.modal?.show?.()
    },

    changeValue (selected, contract) {
      this.$emit('input', selected)
      if (contract.type === 'privacy') {
        Object.assign(this.selectedPolicies, {
          [contract.uniqueId]: selected.includes(contract.uniqueId) ? [0, 1, 2] : []
        })
      }
    },

    togglePolicies (uniqueId, flagIndex) {
      const i = this.selectedPolicies[uniqueId].indexOf(flagIndex)
      Object.assign(this.selectedPolicies, {
        [uniqueId]: i === -1
          ? this.selectedPolicies[uniqueId].concat(flagIndex)
          : this.selectedPolicies[uniqueId].filter(c => c !== flagIndex)
      })
      this.$emit(
        'input',
        this.selectedPolicies[uniqueId].length === 3
          ? Array.from(new Set(this.value.concat(uniqueId)))
          : this.value.filter(v => v !== uniqueId)
      )
    },

    scrollToContract (contract) {
      const el = this.$refs['contract:' + contract.uniqueId]?.[0]
      if (el) {
        el.parentNode.style['scroll-behavior'] = 'smooth'
        el.parentNode.scrollTop = el.offsetTop - 8
        el.parentNode.style['scroll-behavior'] = ''
      }
    },

    getDataUsePolicies (contract) {
      const { profile: { displayName, company } = {} } = contract
      const countries = company?.address?.addressComponent?.country?.long || 'Italy'
      const gyms = displayName || countries
      return !gyms ? [] : [
        this.$t('contract.privacy_consent_1', { gyms }),
        this.$t('contract.privacy_consent_2', { gyms }),
        this.$t('contract.privacy_consent_3', { gyms })
      ]
    },

    getDocumentContent (doc) {
      return (doc.intro ? doc.intro + '<br><br/>' : '') + (doc.content || '')
    },

    getDynamicFields (contract) {
      return {
        source: this.dynamicDataByProfileId[this.source?._id || contract.profile?._id],
        destination: this.dynamicDataByProfileId[this.destination._id]
      }
    },

    extractProfileInfo (profile) {
      return profile.typeCode === 'IN' || profile.typeCode === 'TU'
        ? this.extractIndividualInfo(profile)
        : this.extractBusinessInfo(profile)
    },

    extractBusinessInfo (profile) {
      return this.$utils.extract(profile, [
        { from: 'name', to: 'company-name' },
        { from: 'brand', to: 'company-brand' },
        { from: 'address', to: 'address-legal', transform: addr => addr?.fulladdress },
        { from: 'operativeAddresses', to: 'address-operative', transform: addrs => addrs?.[0]?.fulladdress },
        { from: 'emails', to: 'email', transform: emails => emails?.[0] },
        { from: 'mobiles', to: 'mobile-phone', transform: this.transformPhones },
        { from: 'landlines', to: 'landline-phone', transform: this.transformPhones },
        { from: 'vat', to: 'VAT-code-ID', transform: v => v?.value },
        { from: 'fiscal', to: 'Fiscal-code-ID', transform: v => v?.value },
        { from: 'directors', to: 'directors', transform: dirs => dirs?.map?.(d => d.displayName).join(', ') }
      ])
    },

    extractIndividualInfo (profile) {
      return this.$utils.extract(profile, [
        { from: 'firstname', to: 'name' },
        { from: 'lastname', to: 'surname' },
        { from: 'address', to: 'address', transform: addr => addr?.fulladdress },
        { from: 'pob', to: 'place-of-birth' },
        { from: 'dob', to: 'date-of-birth', transform: dob => dob && this.$dayjs(dob).format('DD.MM.YYYY') },
        { from: 'pins', to: 'personal-identification-number', transform: pins => pins?.[0]?.value },
        { from: 'tins', to: 'personal-tax-number', transform: tins => tins?.[0]?.value },
        { from: 'emails', to: 'email', transform: emails => emails?.[0] },
        { from: 'mobiles', to: 'mobile-phone', transform: this.transformPhones },
        { from: 'landlines', to: 'landline-phone', transform: this.transformPhones }
      ])
    },

    transformPhones (phones) {
      return [phones?.[0]?.prefixNumber, phones?.[0]?.phoneNumber].filter(Boolean).join('')
    }
  }
}
</script>

<style lang="scss">
.cw-contracts-detail {
  @apply text-sm;

  > section {
    &:not(:last-of-type) {
      border-bottom: 3px dashed #fff;
      @apply mb-3 pb-8;
    }
  }

  .cw-rich-text {
    @apply text-sm leading-normal;
  }
}
</style>
