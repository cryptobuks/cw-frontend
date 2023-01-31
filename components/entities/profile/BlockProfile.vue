<template>
  <cw-profile-section-item
    v-if="userRelationship && userRelationship.status !== 'temporary'"
    v-bind="{
      icon: 'person',
      title: `profile.entities.${blockOrUnblock}_contact`,
      loading,
      noNavigation: true
    }"
    @click="
      $confirm(
        `${$t(`profile.entities.${blockOrUnblock}_contact`)}?`,
        blockOrUnblockContact
      )
    "
  />
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: { profile: { type: Object, required: true } },
  data: () => ({
    loading: true
  }),
  computed: {
    ...mapState('profile', ['userRelationship']),
    blockOrUnblock () {
      return ['active'].includes(this.userRelationship?.status)
        ? 'block'
        : 'unblock'
    }
  },
  methods: {
    async blockOrUnblockContact () {
      this.loading = true
      await this.$repos.contactsRepo.blockOrUnblockContact(
        this.profile._id,
        this.blockOrUnblock === 'block'
      )
      this.loading = false
      this.$notifier.success(this.$t(`global.${this.blockOrUnblock}ed`))
    }
  }
}
</script>
