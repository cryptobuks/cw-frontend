<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: `flex flex-col h-profile-body ${
        !loading ? 'bg-white p-4' : ''
      }`,
      showSearchToggler: true,
      hideSearch: false,
      title: $t(`contract.type.${$route.params.documentType}`)
    }"
    @search="keywords = $event"
    v-on="$listeners"
  >
    <base-card-loading v-if="loading" />
    <div v-else>
      <nuxt-child
        v-bind="{
          ...$attrs,
          documents: displayedDocuments,
          previousPage: `${$attrs.previousPage}/${$route.params.documentType}`,
          profile
        }"
      />
      <base-tabs
        v-model="activeTab"
        v-bind="{ tabs, property: 'active', name: 'title' }"
      />

      <div
        v-if="displayedDocuments.length > 0"
        class="flex flex-col space-y-4 mt-4"
      >
        <nuxt-link
          v-for="(document, documentIndex) in displayedDocuments"
          :key="`document-list-${documentIndex}`"
          class="shadow-cw-card rounded-lg w-full flex items-center justify-between px-4 h-20 text-left focus:outline-none"
          :class="[document.class]"
          :to="`${$route.path}/${document._id}`"
        >
          <div class="flex items-center">
            <img
              class="object-cover rounded-full h-16 w-16"
              :src="'/images/user-placeholder.svg'"
              :alt="`business profile`"
            >
            <div class="flex flex-col ml-3">
              <span class="font-bold text-sm">
                {{ $auth.user.company.brand || $auth.user.company.name }}
              </span>
              <div class="text-xs text-gray-600">
                <span
                  v-if="!document.expiredAt"
                  class="font-semibold mb-2 mr-2"
                >
                  {{ $t(`contract.status.${document.status}`) }}
                </span>
                <span v-if="document.status === 'active'">
                  {{ $dayjs(document.signedAt).format('DD.MM.YYYY hh:mm') }}
                </span>
                <span v-else-if="document.status === 'expired'">
                  {{ $dayjs(document.signedAt).format('DD.MM.YYYY hh:mm') }}
                  -
                  {{ $dayjs(document.expiredAt).format('DD.MM.YYYY hh:mm') }}
                </span>
              </div>
            </div>
          </div>
          <base-icon
            v-if="document.status === 'expired'"
            name="check-circle"
            class="text-gray-400"
          />
          <base-icon
            v-else-if="document.status === 'active'"
            name="check-circle"
            class="text-green"
          />
          <base-icon v-else name="alert-circle" size="20" class="text-red" />
        </nuxt-link>
      </div>
      <div v-else class="h-full flex justify-center items-center">
        <h5 class="text-sm font-extrabold">
          {{ $t('contract.not_found') }}
        </h5>
      </div>
    </div>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true },
    signedDocuments: { type: Array, required: true },
    loading: Boolean
  },
  data: () => ({
    activeTab: true,
    tabs: ['active', 'expired'].map(title => ({
      title,
      active: title === 'active'
    }))
  }),
  computed: {
    displayedDocuments () {
      return this.signedDocuments
        .filter(
          document =>
            document.type === this.$route.params.documentType &&
            !document.expiredAt === this.activeTab
        )
        .map(doc => ({
          ...doc,
          status: doc.expiredAt
            ? 'expired'
            : doc.isAccepted
              ? 'active'
              : 'pending'
        }))
    }
  }
}
</script>
