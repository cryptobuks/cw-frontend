<template>
  <base-main-card
    v-if="certificate"
    v-bind="{
      ...$attrs,
      title,
      bodyClass: 'flex flex-col p-4 h-profile-body bg-white',
      actions: [{ icon: 'printer' }],
    }"
    v-on="$listeners"
  >
    <div class="flex justify-between">
      <div class="flex flex-col text-gray-600 text-sm uppercase">
        <span>
          {{ $t("certificates.detail.uploaded") }}
          {{ $dayjs(certificate.createdAt).format("DD.MM.YYYY") }}
        </span>
        <span v-if="certificate.expiry">
          {{
            certificate.type === "enable"
              ? $t("certificates.detail.release_date")
              : $t("certificates.detail.expires")
          }}
          {{ $dayjs(certificate.dates.expiry).format("DD.MM.YYYY") }}
        </span>
      </div>
      <base-switcher
        v-if="
          $auth.isBusiness() && !['curriculum', 'identity'].includes(certType)
        "
        v-model="certificate.approved"
        v-bind="{
          class: 'border rounded-full',
          falseColor: 'red',
          falseText: $t('global.not_approved'),
          trueText: $t('global.approved'),
        }"
      />
    </div>

    <div
      v-if="certificate.subtype === 'competitive'"
      class="flex items-center space-x-2 my-4"
    >
      <span
        class="font-bold uppercase"
      >{{ $t(`certificates.subtype.${certificate.subtype}`) }}:</span>
      <div
        v-for="sport in sports"
        :key="sport._id"
        class="bg-gray-800 rounded-md ml-3 text-white px-2 py-1 flex items-center"
      >
        <span class="text-xs">{{ sport.name }}</span>
      </div>
    </div>
    <div class="h-full mt-6">
      <embed
        :src="$utils.getFileUrl(certificate.file.id, certificate.file.filename)"
        :alt="certificate.file.filename"
        class="h-full w-full"
      >
    </div>
  </base-main-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
  props: { certType: { type: String, required: true } },
  data: () => ({ certificate: null }),
  computed: {
    ...mapGetters('certificates', ['certificateTypes']),
    ...mapState('settings', ['sportInterests']),
    title () {
      return `${this.certificate.progressive}. ${this.$t(
        `certificates.${this.certType}`
      )}`
    },
    sports () {
      return this.sportInterests.filter(spI =>
        (this.certificate.sports || []).includes(spI._id)
      )
    }
  },
  watch: {
    $route: {
      immediate: true,
      deep: true,
      handler ($route) {
        this.certificate = this.$utils.clone(
          this.certificateTypes(this.certType).find(
            cert => cert._id === $route.params.certificateId
          )
        )
      }
    },
    certificate: {
      deep: true,
      async handler (certificate, prev) {
        if (!certificate || !prev) {
          return
        }
        await this.$repos.certificatesRepo.approveOrDisapprove(
          { id: this.certificate._id, ownerId: this.$auth.user._id },
          this.certificate.approved ? 'approve' : 'disapprove'
        )
        this.$emit('updated')
        this.$notifier.success('')
      }
    }
  }
}
</script>
