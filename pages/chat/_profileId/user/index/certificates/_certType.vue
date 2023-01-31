<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      actions: [
        {
          icon: 'add',
          tooltip: $t('global.action_add_tooltip'),
          handler: () => $refs.certificateModal.show()
        }
      ],
      bodyClass: 'flex flex-col px-4 py-4 h-full bg-white',
      hideSearch: false,
      showSearchToggler: true,
      title: $t(`certificates.${certType}`)
    }"
    v-on="$listeners"
    @search="keywords = $event"
  >
    <cw-certificate-modal
      ref="certificateModal"
      v-bind="{ certType, profile }"
      @saved="getCertificates({ profileId: profile._id })"
    />
    <nuxt-child
      v-if="displayedCertificates.length > 0"
      v-bind="{
        ...$attrs,
        certType,
        profile,
        previousPage: `${$attrs.previousPage}/${certType}`
      }"
      @updated="getCertificates({ profileId: profile._id })"
    />
    <div class="flex flex-col space-y-4">
      <div v-if="certType === 'medical'" class="flex items-center">
        <span class="text-xs uppercase mr-3">
          {{ $t('certificates.detail.not_provided_to') }}
        </span>
        <base-multiple-avatars
          v-bind="{
            avatars: ['/images/sample/profile.svg'],
            count: 5,
            size: 'xs',
            spaceBetween: 'ml-1'
          }"
        />
      </div>
      <base-swipe-card
        v-for="certificate in displayedCertificates"
        :key="`certificate-${certificate._id}`"
        v-bind="{
          actions: certActions(certificate),
          autoHeight: true,
          bgColor: 'white',
          containerClass: 'text-black',
          class: 'shadow-cw-card',
          hideEdit: true,
          hideRemove: true,
          togglerClass: 'text-black'
        }"
      >
        <div class="flex justify-between items-center h-20">
          <div class="flex flex-col relative space-y-3">
            <span
              v-if="certType !== 'medical'"
              class="text-xs text-gray-600 uppercase"
            >
              {{ $t('certificates.detail.uploaded') }}
              {{ $dayjs(certificate.createdAt).format('DD.MM.YYYY') }}
            </span>
            <cw-certificate-expiry
              v-if="certificate.expiry && certType === 'medical'"
              v-bind="{ certificate }"
            />
            <nuxt-link
              :to="`${$route.path}/${certificate._id}`"
              class="font-bold text-sm capitalize"
            >
              {{ title(certificate) }}
              <span
                v-if="
                  certificate.subtype &&
                    !['identity', 'medical'].includes(certType)
                "
              >
                ({{ $t(`certificates.subtype.${certificate.subtype}`) }})
              </span>
            </nuxt-link>
            <cw-certificate-expiry
              v-if="certificate.expiry && certType !== 'medical'"
              v-bind="{ certificate }"
            />
            <div
              v-if="certType === 'medical' && certificate.owners.length"
              class="flex items-center"
            >
              <span class="text-xs uppercase mr-1">
                {{ $t('global.approved') }} {{ $t('global.by') }}
              </span>
              <div class="flex items-center">
                <nuxt-link
                  v-for="owner in certificate.owners"
                  :key="`owner-${owner._id}`"
                  v-tippy="{ content: owner.ownerId.displayName }"
                  :to="`/chat/${owner.ownerId._id}/?from=${$route.path}`"
                >
                  <img
                    :src="
                      $utils.getAvatarUrl(owner.wnerId && owner.wnerId.avatar)
                    "
                    class="rounded-full w-5 h-5 mx-1"
                  >
                </nuxt-link>
              </div>
            </div>
          </div>
          <div
            v-if="
              certificate._id === activeCertificate._id &&
                !['curriculum', 'enable'].includes(certType)
            "
          >
            <base-icon
              v-if="certificate.approved"
              name="check-circle"
              :class="
                certificate.status === 'expired'
                  ? 'text-gray-500'
                  : 'text-green'
              "
              size="20"
            />
            <base-icon
              v-else
              name="alert-circle"
              class="text-cw-red"
              size="20"
            />
          </div>
        </div>
      </base-swipe-card>
    </div>
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    certType: null,
    keywords: ''
  }),
  computed: {
    ...mapGetters('certificates', ['certificateTypes']),
    activeCertificate () {
      return this.certificateTypes()[this.certType]?.activeCertificate
    },
    displayedCertificates () {
      if (!this.keywords) {
        return this.certificateTypes(this.certType)
      }
      return this.certificateTypes(this.certType).filter(certificate =>
        this.title(certificate).toLowerCase().match(this.keywords.toLowerCase())
      )
    }
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      handler ($route) {
        this.certType = $route.params.certType
      }
    }
  },
  methods: {
    ...mapActions('certificates', ['getCertificates']),
    certActions (certificate) {
      return certificate.approvals.length > 0
        ? []
        : [
          {
            icon: 'pen',
            handler: () => this.$refs.certificateModal.show(certificate)
          },
          {
            icon: 'bin',
            danger: true,
            color: 'white',
            handler: () =>
              this.$confirm(
                this.$t('global.confirm_remove', {
                  name: this.title(certificate)
                }),
                () => this.deleteCertificate(certificate)
              )
          }
        ]
    },
    async deleteCertificate (certificate) {
      await this.$repos.certificatesRepo.delete(certificate._id)
      this.getCertificates({ profileId: this.profile._id })
      this.$notifier.success('')
    },
    title (certificate) {
      return `${certificate.progressive}. ${
        this.certType === 'enable'
          ? certificate.name
          : this.$t(
              `certificates.${
                ['identity', 'medical'].includes(this.certType)
                  ? `subtype.${certificate.subtype}`
                  : this.certType
              }`
            )
      }`
    }
  }
}
</script>

<style></style>
