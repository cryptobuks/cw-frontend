<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: `flex flex-col h-profile-body ${
        !loading ? 'bg-white p-4' : ''
      }`,
      title: $t('profile.entities.certificates'),
    }"
    v-on="$listeners"
  >
    <nuxt-child
      v-if="!loading"
      v-bind="{
        ...$attrs,
        profile,
        previousPage: `${$attrs.previousPage}/certificates`,
        certTypes: certificateTypes,
      }"
    />
    <base-card-loading v-if="loading" />
    <div v-else class="flex flex-col space-y-4">
      <nuxt-link
        v-for="({ status, activeCertificate }, type) in certificateTypes()"
        :key="`cert-types-${type}`"
        class="shadow-cw-card rounded-lg w-full flex items-center justify-between px-4 h-20 text-left"
        :to="`${$route.path}/${type}`"
      >
        <div class="flex flex-col">
          <span class="font-bold text-sm capitalize">{{
            $t(`certificates.${type}`)
          }}</span>
          <span
            v-if="activeCertificate"
            class="text-xs text-gray uppercase"
            :class="[activeCertificate.expired ? 'text-cw-red' : '']"
          >
            {{ $t("certificates.detail.expires") }}
            {{
              $dayjs(activeCertificate.dates.expiry).format("DD.MM.YYYY")
            }}
          </span>
        </div>
        <div v-if="!['curriculum', 'enable'].includes(type)">
          <base-icon
            v-if="status === 'pending'"
            name="alert-circle"
            class="text-cw-red"
            size="20"
          />
          <base-icon v-else name="check-circle" class="text-green" size="20" />
        </div>
      </nuxt-link>
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
    loading: true
  }),
  computed: { ...mapGetters('certificates', ['certificateTypes']) },
  watch: {
    profile: {
      immediate: true,
      deep: true,
      handler () {
        this.load()
      }
    }
  },
  created () {
    this.getSportInterests()
  },
  methods: {
    ...mapActions('certificates', ['getCertificates']),
    ...mapActions('settings', ['getSportInterests']),
    async load (loading = true) {
      this.loading = loading
      await this.getCertificates({
        profileId: this.profile._id
      })
      this.loading = false
    }
  }
}
</script>

<style></style>
