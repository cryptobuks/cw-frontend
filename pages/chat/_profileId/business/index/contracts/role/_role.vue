<template>
  <cw-contract-document-type
    v-bind="{
      ...$attrs,
      documentType,
      profile,
      role,
      title: $t(`roles.${role}`),
      defaultRoleDocument,
      showDefaultDocs: true
    }"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    documentType: '',
    role: '',
    defaultRoleDocument: null
  }),
  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler ($route) {
        if (
          this.profile._id === $route.params.profileId &&
          this.role === $route.params.role
        ) {
          return
        }
        this.documentType = 'role'
        this.role = $route.params.role
        this.getDefaultRoleDocument()
      }
    }
  },
  methods: {
    async getDefaultRoleDocument () {
      const areas = await this.$repos.contractsRepo.getAreasByDocType(
        this.documentType,
        this.profile
      )

      const area = areas.find(area => area.name === this.role)

      this.defaultRoleDocument =
        area.data.find(doc => doc.status === 'active') || null
    }
  }
}
</script>
