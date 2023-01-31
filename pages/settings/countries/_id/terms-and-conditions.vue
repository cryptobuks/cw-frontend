<template>
  <cw-country-setting-page-template
    :title="$t('pages.terms_n_conditions')"
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
        entity-type="entities.term_n_condition"
        :areas="areas"
        :save="mutateTermsAndConditions"
        @done="done"
      />
    </template>
  </cw-country-setting-page-template>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  async fetch () {
    await this.getTermsAndConditionsList({ countryId: this.$route.params.id })
  },
  computed: mapState('country', ['areas']),
  methods: {
    ...mapActions('country', [
      'getTermsAndConditionsList',
      'mutateTermsAndConditions',
      'removeTermsAndConditions',
      'activateTermsAndConditions'
    ]),
    removeItem ({ item, name }) {
      this.$confirm(this.$t('terms_n_conditions.confirm_remove', { name }))
        .then(() => this.removeTermsAndConditions(item._id))
        .then(res => res.success && this.$notifier.success(res.message))
        .catch(() => {})
    },
    async activateItem (item) {
      const mutationResponse = await this.mutateTermsAndConditions(item)
      if (mutationResponse.success !== true) { return }
      const response = await this.activateTermsAndConditions(item._id)
      response.success && this.$notifier.success(response.message)
    }
  }
}
</script>
