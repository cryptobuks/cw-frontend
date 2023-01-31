<template>
  <cw-contract-document-type
    v-bind="{
      ...$attrs,
      profile,
      documentType,
      title: $t(`contract.type.${documentType}`),
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
    documentType: ''
  }),
  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler ($route) {
        if (
          this.profile._id === $route.params.profileId &&
          this.documentType === $route.params.documentType
        ) {
          return
        }
        this.documentType = $route.params.documentType
      }
    }
  }
}
</script>
