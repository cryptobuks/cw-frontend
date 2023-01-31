<template>
  <base-select
    v-bind="$attrs"
    :items="paymentTerms"
    item-text="name"
    item-value="_id"
    v-on="$listeners"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  data () {
    return {
      paymentTerms: []
    }
  },
  async created () {
    this.paymentTerms = await this.$repos.settingsRepo.paymentTerm.get()
      .then(res => res.data.termsOfPayment)
  }
}
</script>
