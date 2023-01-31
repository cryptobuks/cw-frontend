<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      actions: [
        { icon: 'add', handler: () => $refs.paymentSystemModal.show() }
      ],
      bodyClass: `flex flex-col h-full ${!loading ? 'bg-white p-4' : ''}`,
      title: $t('profile.entities.payment_systems'),
      hideSearch: false,
      showSearchToggler: true
    }"
    @search="keywords = $event"
    v-on="$listeners"
  >
    <cw-payment-sytem-modal ref="paymentSystemModal" @done="getConfig" />
    <base-card-loading v-if="loading" />
    <div v-else class="flex flex-col space-y-4 w-full p-2">
      <base-swipe-card
        v-for="(system, systemIndex) in displayedPaymentSystems"
        :key="`system-${systemIndex}`"
        bg-color="#fff"
        toggler-class="text-black"
        container-class="text-black"
        toggler-color="black"
        auto-height
        class="w-full text-black shadow-cw-card"
        @edit="$refs.paymentSystemModal.show(system)"
        @remove="deleteConfig(system)"
      >
        <div class="flex flex-col h-full p-2 justify-between">
          <b class="font-poppins-bold uppercase text-sm">{{ system.name }}</b>
          <span
            class="text-xs font-poppins-medium"
            :class="[system.active ? 'text-green' : 'text-red']"
          >
            <span
              class="capitalize"
            >{{ $t(`payment_sytems.gateway.${system.gateway}`) }}:</span>
            {{ system.active ? 'active' : 'not active' }}
          </span>
        </div>
      </base-swipe-card>
    </div>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: { profile: { type: Object, required: true } },
  data: () => ({
    keywords: '',
    loading: true,
    paymentSystems: []
  }),
  computed: {
    displayedPaymentSystems () {
      return this.paymentSystems.filter(
        system =>
          system.name.toLowerCase().match(this.keywords.toLowerCase()) ||
          system.gateway.toLowerCase().match(this.keywords.toLowerCase()) ||
          this.$t(`payment_sytems.gateway.${system.gateway}`)
            .toLowerCase()
            .match(this.keywords.toLowerCase())
      )
    }
  },
  created () {
    this.getConfig()
  },
  methods: {
    deleteConfig (system) {
      this.$confirm(
        this.$t('global.confirm_remove', { name: system.name }),
        () => this.$repos.financeRepo.deletePaymentConfig(system._id)
      )
    },
    async getConfig (loading = true) {
      this.loading = loading
      this.paymentSystems = await this.$repos.financeRepo
        .getPaymentConfig()
        .then(data => (!data.config ? [] : data.config.payments))
      this.loading = false
    }
  }
}
</script>
