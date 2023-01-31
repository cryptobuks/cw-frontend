<template>
  <cw-country-setting-page-template
    :title="$t('pages.privacy_policy')"
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
        entity-type="entities.privacy_policy"
        :areas="areas"
        :save="mutatePrivacyPolicy"
        @done="done"
      />
    </template>
  </cw-country-setting-page-template>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  async fetch () {
    await this.getPrivacyPolicyList({ countryId: this.$route.params.id })
  },
  computed: mapState('country', ['areas']),
  methods: {
    ...mapActions('country', [
      'getPrivacyPolicyList',
      'mutatePrivacyPolicy',
      'removePrivacyPolicy',
      'activatePrivacyPolicy'
    ]),
    removeItem ({ item, name }) {
      this.$confirm(this.$t('global.confirm_remove', { name }))
        .then(() => this.removePrivacyPolicy(item._id))
        .then(res => res.success && this.$notifier.success(res.message))
        .catch(() => {})
    },
    async activateItem (item) {
      const mutationResponse = await this.mutatePrivacyPolicy(item)
      if (mutationResponse.success !== true) { return }
      const response = await this.activatePrivacyPolicy(item._id)
      response.success && this.$notifier.success(response.message)
    }
  }
}
</script>
