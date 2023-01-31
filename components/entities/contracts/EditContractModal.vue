<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${
      role ? $t(`roles.${role}`) : $t(`contract.type.${documentType}`)
    }`"
    :loading="saving"
    :disabled="!content"
    @done="submit"
  >
    <base-form class="h-full flex flex-col">
      <base-input-editor
        v-model="content"
        placeholder="Intro"
        :dynamic-fields="dynamicFields"
        autofocus
        no-modal
        class="h-full"
      />
    </base-form>
  </base-modal>
</template>

<script>
export default {
  props: {
    profile: { type: Object, required: true },
    role: { type: String, default: '' },
    documentType: { type: String, required: true }
  },
  data: () => ({
    content: null,
    dynamicFields: [
      'company-name',
      'company-brand',
      'address',
      'VAT-code-ID',
      'Fiscal-code-ID',
      'email',
      'mobile-phone',
      'landline-phone',
      'directors'
    ].map(value => ({
      text: `Source ${value.replace(/-/g, ' ')}`,
      value: `source.${value}`
    })),
    editedDocument: null,
    saving: false
  }),
  watch: {
    editedDocument: {
      immediate: true,
      deep: true,
      handler (document) {
        if (!document) {
          return
        }
        this.content = document.content
      }
    }
  },
  methods: {
    show (document) {
      this.editedDocument = document
      this.$refs.modal.show()
    },
    async submit () {
      this.saving = true
      await this.$repos.contractsRepo.updateDocument({
        ownerId: this.profile._id,
        id: this.editedDocument._id,
        content: this.content
      })
      this.saving = false
      this.content = null
      this.$notifier.success('Document Updated')
      this.$emit('done')
      this.$refs.modal.hide()
    }
  }
}
</script>
