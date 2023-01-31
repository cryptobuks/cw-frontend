<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col h-profile-body bg-white p-4',
      title: $t('contract.signatures'),
      showSearchToggler: true,
      hideSearch: false
    }"
    @search="keywords = $event"
    v-on="$listeners"
  >
    <base-tabs
      v-model="activeTab"
      v-bind="{ tabs, property: 'name', name: 'title' }"
    />

    <div
      v-if="displayedSignatures.length > 0"
      class="flex flex-col space-y-4 mt-4"
    >
      <div
        v-for="(signature, signatureIndex) in displayedSignatures"
        :key="`signature-${signatureIndex}`"
        class="flex shadow-cw-card rounded-lg p-4"
      >
        <img
          :src="$utils.getAvatarUrl(signature.profileId.avatar)"
          :alt="signature.profileId.person.firstname"
          class="h-12 w-12 rounded-full"
        >
        <div class="ml-4">
          <span
            class="block font-bold"
          >{{ signature.profileId.person.firstname }}
            {{ signature.profileId.person.lastname }}</span>
          <span class="text-sm text-gray-700">{{
            $dayjs(signature.signedAt).format('DD/MM/YYYY hh:mm')
          }}</span>
        </div>
      </div>
    </div>
    <div v-else class="h-full flex justify-center pt-4">
      <h5 class="text-sm font-extrabold">
        {{ $t('contract.no_signatures') }}
      </h5>
    </div>
  </base-main-card>
</template>

<script>
export default {
  props: {
    profile: { type: Object, required: true },
    signatures: { type: Array, required: true }
  },
  data: () => ({
    activeTab: true,
    keywords: null
  }),
  computed: {
    displayedSignatures () {
      if (!this.signatures) {
        return []
      }
      const signatures = this.signatures.filter(
        signature => signature.isAccepted === this.activeTab
      )
      if (!this.keywords) {
        return signatures
      }
      return signatures
        .filter(
          signature =>
            signature.profileId.person.firstname
              .toLowerCase()
              .match(this.keywords) ||
            signature.profileId.person.lastname
              .toLowerCase()
              .match(this.keywords)
        )
        .sort((a, b) =>
          a.name < b.person.firstname
            ? -1
            : a.person.firstname > b.person.firstname
              ? 1
              : 0
        )
    },
    tabs () {
      return [
        { title: `Accepted (${this.signatures.length})`, name: true },
        { title: 'Not Accepted', name: false }
      ]
    }
  }
}
</script>
