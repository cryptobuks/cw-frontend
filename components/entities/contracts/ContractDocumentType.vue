<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      actions: [
        {
          icon: 'add',
          tooltip: $t('global.action_add_tooltip'),
          handler: () => $refs.createContractModal.show()
        }
      ],
      bodyClass: `flex flex-col h-full ${
        !defaultDocumentsLoading && !documentsLoading ? 'bg-white p-4' : ''
      }`,
      hideSearch: false,
      showSearchToggler: true,
      title
    }"
    @search="keywords = $event"
    v-on="$listeners"
  >
    <cw-create-contract-modal
      ref="createContractModal"
      v-bind="{ profile, documentType, role }"
      @created="getDocuments(false)"
    />
    <cw-edit-contract-modal
      ref="editContractModal"
      v-bind="{ profile, documentType, role }"
      @done="getDocuments(false)"
    />

    <cw-contract-confirmation-popup
      ref="confirmationPopup"
      @update="(document) => updateDocStatus(document, true)"
    />

    <nuxt-child
      v-if="!defaultDocumentsLoading && !documentsLoading"
      v-bind="{
        ...$attrs,
        defaultRoleDocument,
        documents: documents.concat(defaultDocuments),
        profile,
        previousPage: `${$attrs.previousPage}/${
          documentType === 'role' ? role : documentType
        }`
      }"
      @updated="getDocuments(false)"
    />

    <base-card-loading v-if="defaultDocumentsLoading || documentsLoading" />
    <cw-default-documents
      v-if="showDefaultDocs"
      v-model="activeDocument"
      v-bind="{ documentType, keywords, profile, role }"
      class="mb-2"
      @update="(document) => updateDocStatus(document, true)"
      @loaded="setDefaultDocuments"
    />
    <div
      v-if="!defaultDocumentsLoading && !documentsLoading"
      class="flex flex-col space-y-4"
    >
      <base-swipe-card
        v-for="document in filteredDocuments"
        :key="`privacy-document-${document._id}`"
        auto-height
        bg-color="white"
        container-class="text-black"
        class="shadow-cw-card"
        :actions="docActions(document)"
        toggler-class="text-black"
      >
        <div class="flex justify-between h-20 cursor-pointer">
          <div class="flex flex-col relative space-y-3">
            <cw-document-status v-bind="{ document }" />
            <nuxt-link
              :to="`${$route.path}/${document._id}`"
              class="font-bold text-sm"
            >
              {{ document.title }}
            </nuxt-link>
            <div v-if="document.signatures" class="flex items-center">
              <base-icon name="person" size="12" />
              <span class="ml-2 text-xs">{{ document.signatures.length }}</span>
            </div>
          </div>
          <div
            v-if="document.status !== 'expired'"
            class="flex h-full items-center"
          >
            <base-input-radio
              :result="activeDocument"
              :value="document"
              :disabled="activeDocument && activeDocument._id === document._id"
              input-key="_id"
              @change="confirm(document)"
            />
          </div>
        </div>
      </base-swipe-card>

      <base-card-no-data
        v-if="filteredDocuments.length < 1 && defaultDocuments.length < 1"
      />
    </div>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    defaultRoleDocument: { type: null, default: null },
    documentType: { type: String, required: true },
    profile: { type: Object, required: true },
    role: { type: String, default: '' },
    showDefaultDocs: Boolean,
    title: { type: String, required: true }
  },
  data: () => ({
    activeDocument: null,
    defaultDocuments: [],
    defaultDocumentsLoading: true,
    documents: [],
    documentsLoading: true,
    keywords: ''
  }),
  computed: {
    filteredDocuments () {
      return this.documents.filter(
        document =>
          document.content.toLowerCase().match(this.keywords.toLowerCase()) ||
          (document.title &&
            document.title.toLowerCase().match(this.keywords.toLowerCase()))
      )
    }
  },
  watch: {
    documentType: {
      immediate: true,
      handler () {
        this.getDocuments()
      }
    }
  },
  methods: {
    confirm (document) {
      if (this.documentType === 'role') {
        return this.$confirm(
          this.$t('contract.switch_to', { name: document.title }),
          () => this.updateDocStatus(document, true)
        )
      }
      this.$refs.confirmationPopup.show(document)
    },
    deactivateOthers (document) {
      for (const doc of this.documents) {
        if (doc.status === 'active' && document._id !== doc._id) {
          this.updateDocStatus(doc, false)
        }
      }
    },
    deleteDocument (document) {
      this.$confirm(
        this.$t('global.confirm_remove', { name: document.title }),
        async () => {
          await this.$repos.contractsRepo.deleteDocument(document._id)
          this.getDocuments(false)
        }
      )
    },
    docActions (document) {
      return [
        {
          icon: document.status === 'draft' ? 'bin' : 'eye',
          danger: document.status === 'draft',
          color: document.status === 'draft' ? 'white' : undefined,
          handler: () =>
            document.status === 'draft'
              ? this.deleteDocument(document)
              : this.$router.push(`${this.$route.path}/${document._id}`),
          secondary: document.status !== 'draft'
        },
        {
          icon: document.status === 'draft' ? 'pen' : 'copy',
          handler: () =>
            document.status === 'draft'
              ? this.$refs.editContractModal.show(document)
              : this.$refs.createContractModal.show(document)
        }
      ]
    },
    docTitle (document) {
      return `${document.progressive}. ${this.profile.brand} ${
        this.role
          ? `${this.$t(`roles.${this.role}`)} ${this.$t('global.document')}`
          : this.$t(`contract.type.${this.documentType}`)
      }`
    },
    async getDocuments (loading = true) {
      if (!this.documentType) {
        return
      }
      this.documentsLoading = loading
      const ranks = { draft: 3, active: 2, expired: 1 }
      this.documents = await this.$repos.contractsRepo.getDocumentsByType({
        ownerId: this.profile._id,
        type: this.documentType,
        role: this.role || undefined
      })
      this.documents =
        (this.documents &&
          this.documents
            .map(doc => ({
              ...doc,
              title: this.docTitle(doc)
            }))
            .sort((a, b) => ranks[b.status] - ranks[a.status])) ||
        []
      this.activeDocument =
        this.documents.find(doc => doc.status === 'active') || null

      this.getSignatures()

      this.documentsLoading = false
      if (!this.showDefaultDocs) {
        this.defaultDocumentsLoading = false
      } else {
        this.matchDefaultDocs()
      }
    },
    async getSignatures () {
      const docSignatures = await Promise.all(
        this.documents.map(doc =>
          this.$repos.contractsRepo.getDocSignatures(doc._id)
        )
      )
      for (const index in this.documents) {
        const signatures = docSignatures[index] || []
        signatures.sort((a, b) => {
          a = a.profileId.person.firstname
          b = b.profileId.person.firstname
          return a === b ? 0 : a < b ? -1 : 1
        })
        this.documents[index].signatures = signatures
      }
      this.$forceUpdate()
    },
    matchDefaultDocs () {
      if (this.defaultDocumentsLoading || this.documentsLoading) {
        return
      }
      for (const defaultDoc of this.defaultDocuments) {
        for (const docIndex in this.documents) {
          if (defaultDoc._id === this.documents[docIndex].referenceDoc) {
            if (this.documents[docIndex].status === 'expired') {
              this.documents.splice(docIndex, 1)
              continue
            }
            this.documents[docIndex] = {
              ...this.documents[docIndex],
              title: defaultDoc.title,
              content: defaultDoc.content
            }
          }
        }
      }
    },
    setDefaultDocuments (documents) {
      this.defaultDocuments = documents
      this.defaultDocumentsLoading = false
      this.matchDefaultDocs()
    },
    async updateDocStatus (document, activate) {
      const currentDate = this.$dayjs().format('YYYY-MM-DD')
      if (activate === true) {
        this.deactivateOthers(document)
      }

      await this.$repos.contractsRepo.updateDocument({
        ownerId: this.profile._id,
        type: this.documentType,
        id: document._id,
        content: document.content,
        isDefaultDocument: document.isDefaultDocument,
        referenceDoc: document.referenceDoc,
        activatedAt: activate ? currentDate : undefined,
        expiredAt: !activate ? currentDate : undefined
      })
      this.getDocuments(false)

      if (activate === true) {
        this.$notifier.success('Document Activated')
      }
    }
  }
}
</script>
