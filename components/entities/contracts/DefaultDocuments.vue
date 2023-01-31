<template>
  <div class="flex flex-col space-y-4">
    <cw-contract-confirmation-popup
      ref="confirmationPopup"
      @update="useDocument"
    />
    <base-swipe-card
      v-for="document in filteredDocuments"
      :key="`privacy-document-${document._id}`"
      v-slot="{}"
      auto-height
      bg-color="white"
      container-class="text-black"
      class="shadow-cw-card"
      :actions="[
        {
          icon: 'eye',
          handler: () => $router.push(`${$route.path}/${document._id}`),
          secondary: true
        },
        { icon: 'copy', handler: () => duplicate(document) }
      ]"
      toggler-class="text-black"
    >
      <div class="flex justify-between h-20 cursor-pointer">
        <div class="flex flex-col relative space-y-3">
          <div class="text-xs text-gray-600 hidden">
            <span class="font-semibold mb-2 mr-1">
              {{ $t(`contract.status.published`) }}
            </span>
            <span>
              {{ $dayjs(document.activatedAt).format('DD.MM.YYYY') }}
            </span>
          </div>
          <nuxt-link
            :to="`${$route.path}/${document._id}`"
            class="font-bold text-sm"
          >
            {{ document.title }}
          </nuxt-link>
        </div>
        <div
          v-if="document.status !== 'expired'"
          class="flex h-full items-center"
        >
          <base-input-radio
            :value="document"
            input-key="_id"
            :result="activeDocument"
            @change="confirm(document)"
          />
        </div>
      </div>
    </base-swipe-card>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'activeDocument',
    event: 'change'
  },
  props: {
    activeDocument: { type: null, required: true },
    documentType: { type: String, required: true },
    profile: { type: Object, required: true },
    role: { type: String, default: null }
  },
  data: () => ({
    documents: [],
    documentsLoading: true
  }),
  computed: {
    filteredDocuments () {
      return this.documents.filter(document =>
        document.content
          .toLowerCase()
          .match(this.keywords?.toLowerCase() || '') && this.activeDocument
          ? document._id !== this.activeDocument.referenceDoc
          : true
      )
    }
  },
  watch: {
    profile: {
      immediate: true,
      deep: true,
      async handler (profile) {
        const areas = await this.$repos.contractsRepo.getAreasByDocType(
          this.documentType,
          profile
        )

        const name = this.role
          ? this.role
          : this.$auth.profileType(this.profile.typeCode).contractArea

        const area = areas.find(area => area.name === name)

        if (!area) {
          return
        }

        this.documents = area.data
          .filter(doc => doc.status === 'active')
          .map(doc => ({
            ...doc,
            title: `${
              doc.progressive
            }. Default ${area.name.toUpperCase()} ${this.$t(
              `contract.type.${this.documentType}`
            )}`
          }))

        this.documentsLoading = false
      }
    },
    documentsLoading (loading) {
      if (loading === false) {
        this.$emit('loaded', this.documents)
      }
    }
  },
  methods: {
    confirm (document) {
      if (this.documentType === 'role') {
        return this.$confirm(
          this.$t('contract.switch_to', { name: document.title }),
          () => this.useDocument(document)
        )
      }
      this.$refs.confirmationPopup.show(document)
    },
    async useDocument (document) {
      this.$emit('change', document)
      const newDocument = await this.$repos.contractsRepo.createDocument({
        ownerId: this.profile._id,
        type: this.documentType,
        role: this.role || undefined,
        content: document.content,
        isDefaultDocument: true,
        referenceDoc: document._id
      })
      this.$emit('update', newDocument)
    }
  }
}
</script>
