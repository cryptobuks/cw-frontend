<template>
  <cw-country-setting-page-template
    :title="$t('pages.commercial_contract')"
    :areas="areas"
    @mutate="$refs.maker.show($event)"
    @remove="removeItem"
    @activate="activateItem"
  >
    <template #modals="{ done }">
      <cw-general-country-document-maker
        ref="maker"
        entity-type="entities.commercial_contract"
        :save="mutateCommercialContract"
        :areas="areas"
        @done="done"
      />
    </template>
  </cw-country-setting-page-template>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  async fetch () {
    await this.getCommercialContractList({ countryId: this.$route.params.id })
  },
  computed: mapState('country', ['areas']),
  methods: {
    ...mapActions('country', [
      'getCommercialContractList',
      'mutateCommercialContract',
      'removeCommercialContract',
      'activateCommercialContract'
    ]),
    removeItem ({ item, name }) {
      this.$confirm(this.$t('commercial_contract.confirm_remove', { name }))
        .then(() => this.removeCommercialContract(item._id))
        .then(res => res.success && this.$notifier.success(res.message))
        .catch(() => {})
    },
    activateItem ({ item, name }) {
      this.$confirm(this.$t('commercial_contract.confirm_activate', { name }))
        .then(() => this.activateCommercialContract(item._id))
        .then(res => res.success && this.$notifier.success(res.message))
        .catch(() => {})
    }
  }
}
</script>
