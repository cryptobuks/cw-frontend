<template>
  <div>
    <cw-custom-select
      v-bind="{
        display: (data) => data.map((r) => $t(`roles.${r}`)).join(' | '),
        items: ['FR', ...businessRoles],
        itemText: (role) => $t(`roles.${role}`),
        value: data,
      }"
      @new="(role) => addRole(role)"
    />
    <cw-assign-role-modal
      ref="modal"
      v-bind="{
        companyId: $auth.user._id,
        profile,
        role: assignedRole,
        showExistingProfile: true,
      }"
      @done="updateRoles"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  data: () => ({
    data: [],
    assignedRole: null
  }),
  computed: {
    ...mapGetters('profile', ['businessRoles']),
    ...mapState('profile', ['profile', 'userRoles'])
  },
  watch: {
    userRoles: {
      immediate: true,
      deep: true,
      handler (roles) {
        this.data = this.$utils.clone(
          ['FR', ...roles].filter(role => this.businessRoles.includes(role))
        )
      }
    }
  },
  methods: {
    ...mapActions('profile', ['getUserRoles']),
    addRole (role) {
      this.assignedRole = role
      this.$refs.modal.show({ role })
    },
    updateRoles () {
      this.getUserRoles({
        gymId: this.$auth.user._id,
        profileId: this.profile._id
      })
    }
  }
}
</script>
