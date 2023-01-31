<template>
  <base-swipe-card
    v-if="bank"
    v-bind="$attrs"
    auto-height
    bg-color="#404040"
    v-on="$listeners"
  >
    <template #title>
      {{ bank.name }} <span class="text-base font-normal">({{ getCountryName(bank.countryCode) }})</span>

      <slot name="title-append" />
    </template>

    <div v-if="bank.iban || bank.account" class="mt-2 truncate">
      {{ bank.iban ? 'IBAN' : $t('bank.account.label') }}: {{ bank.iban || bank.account }}
    </div>

    <div v-if="bank.bic || bank.routingNumber" class="mt-2 truncate">
      {{ bank.bic ? 'SWIFT' : $t('bank.routingNumber.label') }}: {{ bank.bic || bank.routingNumber }}
    </div>
  </base-swipe-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    bank: { type: Object, default: () => null }
  },
  computed: mapGetters('country', ['localizedCountries']),
  created () {
    this.$store.dispatch('country/getCountries')
  },
  methods: {
    getCountryName (countryCode) {
      return this.localizedCountries.find(c => c.code === countryCode)?.name
    }
  }
}
</script>
