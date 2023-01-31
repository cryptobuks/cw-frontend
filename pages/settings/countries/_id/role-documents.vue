<template>
  <cw-country-setting-page-template
    :title="$t('pages.role_documents')"
    :areas="areas"
    @mutate="$refs.maker.show($event)"
    @remove="removeItem"
    @activate="
      $refs.confirmationPopup.show({ ...$event.item, title: $event.name })
    "
  >
    <template #modals="{ done }">
      <cw-contract-confirmation-popup
        ref="confirmationPopup"
        @update="activateItem"
      />
      <cw-general-country-document-maker
        ref="maker"
        entity-type="entities.role_document"
        :areas="areas"
        :save="mutateRoleDocuments"
        @done="done"
      />
    </template>
  </cw-country-setting-page-template>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  async fetch () {
    await this.getRoleDocumentsList({ countryId: this.$route.params.id })
  },
  computed: mapState('country', ['areas']),
  methods: {
    ...mapActions('country', [
      'getRoleDocumentsList',
      'mutateRoleDocuments',
      'removeRoleDocuments',
      'activateRoleDocuments'
    ]),
    removeItem ({ item, name }) {
      this.$confirm(this.$t('role_documents.confirm_remove', { name }))
        .then(() => this.removeRoleDocuments(item._id))
        .then(res => res.success && this.$notifier.success(res.message))
        .catch(() => {})
    },
    async activateItem (item) {
      const mutationResponse = await this.mutateRoleDocuments(item)
      if (mutationResponse.success !== true) { return }
      const response = await this.activateRoleDocuments(item._id)
      response.success && this.$notifier.success(response.message)
    }
  }
}
</script>
