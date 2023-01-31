<template>
  <nuxt-child
    v-if="!loading"
    v-bind="{
      hideSearch: true,
      profile
    }"
  />
  <base-card-loading v-else roundness="rounded-10px lg:rounded-tl-none lg:rounded-bl-none" />
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data: () => ({
    loading: true
  }),
  computed: mapState('profile', ['profile']),
  watch: {
    $route: {
      immediate: true,
      deep: true,
      async handler ($route) {
        const profileId = $route.params.profileId
        if (!this.profile || profileId !== this.profile._id) {
          this.loading = true
          await this.getProfile(profileId)
          await this.getUserRoles()
        }
        this.loading = false
        const routeByProfile = `/chat/${profileId}/${
          this.$auth.profileType(this.profile.typeCode).interface
        }`
        if (!this.$route.path.match(routeByProfile)) {
          this.$router.replace(routeByProfile)
        }
      }
    }
  },
  methods: {
    ...mapActions('profile', ['getProfile', 'getUserRoles']),
    close () {
      this.$router.push('/chat')
    }
  }
}
</script>

<style></style>
