<template>
  <base-modal
    ref="modal"
    :title="`${$t('global.manage')} ${
      role ? $t(`roles.${role}`) : $t(`contract.type.${documentType}`)
    }`"
    :loading="saving"
    :disabled="!content"
    @done="submit"
    @dismiss="hide"
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
    documentType: { type: String, default: '' },
    profile: { type: Object, required: true },
    role: { type: String, default: '' }
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
    saving: false
  }),
  methods: {
    show (copiedDocument = null) {
      this.content = copiedDocument?.content || null
      this.$refs.modal.show()
    },
    hide () {
      this.content = null
      this.$refs.modal.hide()
    },
    async submit () {
      this.saving = true
      await this.$repos.contractsRepo.createDocument({
        ownerId: this.profile._id,
        type: this.documentType,
        role: this.role || undefined,
        content: this.content
      })
      this.saving = false
      this.content = null
      this.$notifier.success('Document Created')
      this.$emit('created')
      this.hide()
    }
  }
}
</script>
