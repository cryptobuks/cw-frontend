<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      title: $t(`profile.entities.contracts`),
      bodyClass: 'flex flex-col h-profile-body bg-white p-4'
    }"
    v-on="$listeners"
  >
    <nuxt-child
      v-if="!loading"
      v-bind="{
        ...$attrs,
        profile,
        previousPage: `${$attrs.previousPage}/contracts`,
        signedDocuments,
        loading
      }"
    />

    <div class="flex flex-col space-y-4">
      <nuxt-link
        v-for="(contract, contractIndex) in contracts"
        :key="`contracts-${contractIndex}`"
        class="shadow-cw-card rounded-lg w-full flex items-center justify-between px-4 h-20 text-left focus:outline-none"
        :class="[contract.class]"
        :to="`${$route.path}/${contract.type ? contract.type : ''}`"
      >
        <span class="font-bold text-sm capitalize">{{
          $t(`contract.type.${contract.type}`)
        }}</span>
        <base-icon v-if="contract.status === 'approved'" name="check-green" />
        <base-icon
          v-else-if="contract.status === 'not-approved'"
          name="alert-circle"
          size="20"
          class="text-red"
        />
      </nuxt-link>
    </div>
  </base-main-card>
</template>

<script>
export default {
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    signedDocuments: [],
    loading: true
  }),
  computed: {
    contracts () {
      const contracts = {
        privacy: null,
        term: null,
        collaborations: null,
        referrant: null,
        insurance: null
      }
      const handledContracts = []
      for (const doc of this.signedDocuments) {
        if (handledContracts.includes(doc.type)) { continue }
        contracts[doc.type] = doc.isAccepted ? 'approved' : 'not-approved'
        handledContracts.push(doc.type)
      }
      return Object.entries(contracts).map(([type, status]) => ({
        type,
        status
      }))
    }
  },
  watch: {
    profile: {
      immediate: true,
      deep: true,
      async handler (profile) {
        this.loading = true
        this.signedDocuments = await this.$repos.contractsRepo
          .getDocumentsSignedByProfile({
            ownerId: this.$auth.user._id,
            profileId: profile._id
          })
          .then(docs =>
            docs.sort(
              (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
            )
          )

        this.loading = false
      }
    }
  }
}
</script>

<style></style>
