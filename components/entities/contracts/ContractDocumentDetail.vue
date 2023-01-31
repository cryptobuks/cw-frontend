<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      actions,
      bodyClass: `flex flex-col h-profile-body ${
        !loading ? 'bg-white p-4' : ''
      }`,
      title: document && document.title
    }"
    v-on="$listeners"
  >
    <nuxt-child
      v-bind="{
        ...$attrs,
        profile,
        previousPage: `${$attrs.previousPage}/${documentId}`,
        signatures: [...(document.signatures || []), ...pendingSignatures]
      }"
    />

    <cw-create-contract-modal
      ref="createContractModal"
      v-bind="{
        profile,
        roleCode,
        documentType: document.type
      }"
      @done="$emit('updated')"
    />
    <cw-edit-contract-modal
      ref="editContractModal"
      v-bind="{
        documentType: document.type,
        profile,
        roleCode
      }"
      @done="documentUpdated"
    />

    <base-card-loading v-if="loading" />
    <div v-else-if="document" class="flex flex-col">
      <cw-document-status
        v-bind="{ document }"
        class="text-sm my-3 capitalize"
      />
      <base-multiple-avatars
        v-if="profileType.interface === 'business'"
        v-bind="{ avatars, count: avatarCount }"
        @more="$router.push(`${$route.path}/signatures`)"
      >
        <template #more="avatarData">
          <button
            v-if="avatarData.more > 0"
            class="ml-3 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold focus:outline-none text-xs"
            :class="[avatarData.sizeClass]"
          >
            {{ document.signatures && document.signatures.length }}
          </button>
        </template>
      </base-multiple-avatars>
      <base-printer ref="printer" class="profile-doc-detail">
        <div class="text-sm mt-2 mb-8">
          <cw-editor-text-viewer
            v-bind="{
              dynamicEntities: { source: extractedBusinessInfo },
              value: defaultRoleDocument && defaultRoleDocument.intro
            }"
            class="text-justify mt-12"
          />
        </div>
        <div class="text-sm">
          <cw-editor-text-viewer
            v-bind="{
              dynamicEntities: { source: extractedBusinessInfo },
              value: document.content
            }"
            class="text-justify mt-12"
          />
        </div>
        <div v-if="profileType.interface === 'user'">
          <div class="my-6 border-t-2 w-full" />
          <span
            v-for="(signature, signatureIndex) in document.signatures"
            :key="`doc-signature-${signatureIndex}`"
            class="text-gray-500 text-sm font-semibold mb-1"
          >
            <span class="capitalize">{{ $t(`contract.accepted_by`) }}</span>
            {{ signature.profileId.person.firstname }}
            {{ signature.profileId.person.lastname }} on
            {{ $dayjs(signature.signedAt).format('DD.MM.YYYY hh:mm') }} via IP:
            {{ signature.IP }}
          </span>
        </div>
      </base-printer>
    </div>
    <div v-else class="h-full flex justify-center items-center">
      <h5 class="text-lg font-extrabold">
        {{ $t('contract.not_found') }}
      </h5>
    </div>
  </base-main-card>
</template>

<script>
export default {
  props: {
    defaultRoleDocument: { type: null, default: null },
    documents: { type: Array, required: true },
    profile: { type: Object, required: true },
    roleCode: { type: String, default: null }
  },
  data: () => ({
    avatarCount: 6,
    document: null,
    documentId: null,
    loading: true,
    pendingSignatures: [],
    signaturesLoading: false,
    owner: null
  }),
  computed: {
    actions () {
      if (!this.document) {
        return []
      }
      const draftAction = {
        icon: 'pen',
        tooltip: this.$t('contract.action.edit'),
        handler: () => this.$refs.editContractModal.show(this.document)
      }
      const nonDraftAction = {
        icon: 'copy',
        tooltip: this.$t('contract.action.duplicate'),
        handler: () => this.$refs.createContractModal.show(this.document)
      }
      return [
        {
          icon: 'printer',
          tooltip: this.$t('contract.action.print'),
          handler: () => this.$refs.printer.print({ title: this.title })
        },
        this.document.status === 'draft' ? draftAction : nonDraftAction
      ]
    },
    avatars () {
      return (this.document.signatures || []).map(signature =>
        this.$utils.getAvatarUrl(signature.profileId.avatar)
      )
    },
    extractedBusinessInfo () {
      if (!this.owner) {
        return {}
      }
      return this.$utils.extract(this.owner, [
        { from: 'name', to: 'company-name' },
        { from: 'brand', to: 'company-brand' },
        {
          from: 'address',
          to: 'address-legal',
          transform: addr => addr?.fulladdress
        },
        {
          from: 'operativeAddresses',
          to: 'address-operative',
          transform: addrs => addrs?.[0]?.fulladdress
        },
        { from: 'emails', to: 'email', transform: emails => emails?.[0] },
        {
          from: 'mobiles',
          to: 'mobile-phone',
          transform: this.transformPhones
        },
        {
          from: 'landlines',
          to: 'landline-phone',
          transform: this.transformPhones
        },
        { from: 'vat', to: 'VAT-code-ID', transform: v => v?.value },
        { from: 'fiscal', to: 'Fiscal-code-ID', transform: v => v?.value },
        {
          from: 'directors',
          to: 'directors',
          transform: dirs => dirs?.map?.(d => d.displayName).join(', ')
        }
      ])
    },
    profileType () {
      return this.$auth.profileType(this.profile.typeCode)
    }
  },
  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler ($route) {
        if (this.documentId === $route.params.documentId) {
          return
        }
        this.documentId = $route.params.documentId
        this.getDocument()
      }
    }
  },
  methods: {
    documentUpdated () {
      this.$emit('updated')
      this.getDocument(false, true)
    },
    async getDocument (loading = true, fromAPI = false) {
      this.loading = loading
      if (!fromAPI) {
        this.document = this.documents.find(
          doc => doc._id === this.documentId
        )
      }

      if (!this.document) {
        this.document = await this.$repos.contractsRepo.getDocumentById(
          this.documentId
        )
      }
      this.getSignatures()
      this.getPendingSIgnatures()
      await this.getOwner()
      this.loading = false
    },
    async getPendingSIgnatures () {
      this.pendingSignatures = await this.$repos.contractsRepo
        .getPendingDocSignatures(this.documentId)
        .then((signatures = []) =>
          signatures.map(s => ({ ...s, isAccepted: false }))
        )
    },
    async getSignatures (signaturesLoading = true) {
      this.signaturesLoading = signaturesLoading
      this.document.signatures =
        (await this.$repos.contractsRepo.getDocSignatures(this.documentId)) ||
        []
      this.signaturesLoading = false
    },
    async getOwner () {
      this.owner = await this.$repos.profileRepo.getProfileById(
        this.document.ownerId
      )
    }
  }
}
</script>

<style>
.profile-doc-detail .cw-rich-text {
  @apply text-sm !important;
}
</style>
