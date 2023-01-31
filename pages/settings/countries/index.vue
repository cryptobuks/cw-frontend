<template>
  <base-main-card
    v-slot="{ items }"
    :title="$t('nav.countries')"
    :items="sortedCountries"
    :item-text="(c) => c.name"
    class="cw-countries"
  >
    <base-card-list-container :items="items">
      <template #item="{ item: country }">
        <base-swipe-card
          class="cursor-pointer"
          hide-actions
          @click="toggleCountryMenu(country._id)"
        >
          <div
            class="flex flex-col justify-between p-1 leading-none font-bold h-30"
          >
            <div class="flex items-end justify-end">
              <span
                v-if="getCount(country.code)"
                v-tippy="
                  `<div class='text-right'>` +
                    $t('settings.countries.tooltip.stats_gym') +
                    `<br>(<span class='text-green'>${gymCurrentActive(
                      country.code
                    )}</span> | <span class='text-red'>${gymCurrentTemporary(
                      country.code
                    )}</span>)</div>`
                "
              >
                <base-icon name="gym" size="20" class="mr-1" />
                <span class="mr-1 text-xs">{{
                  gymCurrentTotal(country.code)
                }}</span>
                <span
                  class="text-xs"
                >{{ getCurrentAverage(country.code) }}%</span>
              </span>
            </div>

            <div class="flex items-center">
              <img
                :src="`/images/flag/${country.code}.svg`"
                class="w-12 h-12 rounded-full object-cover mr-3"
              >
              <h3 class="text-xl">
                {{ country.name }}
              </h3>
            </div>

            <div class="flex items-end justify-end">
              <span
                v-if="getCount(country.code)"
                v-tippy="
                  `<div class='text-right'>` +
                    $t('settings.countries.tooltip.stats_profile') +
                    `<br>(<span class='text-green'>${getContactActive(
                      country.code
                    )}</span> | <span class='text-orange'>${getContactTemporary(
                      country.code
                    )}</span>)</div>`
                "
              >
                <base-icon name="person" size="20" class="mr-1" />
                <span class="mr-1 text-xs">{{
                  getContactTotal(country.code)
                }}</span>
                <span
                  class="text-xs"
                >{{ getContactAverage(country.code) }}%</span>
              </span>
            </div>
          </div>

          <div
            v-if="expandedCountryId === country._id"
            class="text-center mt-4"
          >
            <nuxt-link
              v-for="page in subPages"
              :key="page.to"
              :to="`/settings/countries/${expandedCountryId}/${page.to}`"
              class="cw-countries__sub-page pt-4 mt-4 border-t border-t-gray-400 block"
            >
              {{ $t(page.title) }}
            </nuxt-link>
          </div>
        </base-swipe-card>
      </template>
    </base-card-list-container>
  </base-main-card>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  meta: {
    permission: 'settings.countries'
  },
  async fetch () {
    await this.getCountrySettings()
    this.stats = await this.$repos.statRepo.countryStats()
  },
  data () {
    return {
      expandedCountryId: null,
      subPages: [
        { to: 'privacy-policies', title: 'pages.privacy_policy' },
        { to: 'terms-and-conditions', title: 'pages.terms_n_conditions' },
        { to: 'role-documents', title: 'pages.role_documents' },
        // { to: 'commercial-contract', title: 'pages.commercial_contract' }, Deprecated
        { to: 'cw-price-list', title: 'pages.price_list' },
        { to: 'age-target', title: 'pages.age_target' },
        { to: 'vat-rates', title: 'pages.vat_rate' }
      ],
      stats: []
    }
  },
  computed: {
    ...mapState('country', ['countrySettings']),

    sortedCountries () {
      return [...this.countrySettings].sort((a, b) =>
        a.name > b.name ? 1 : -1
      )
    }
  },
  methods: {
    ...mapActions('country', ['getCountrySettings']),
    toggleCountryMenu (id) {
      this.expandedCountryId = this.expandedCountryId === id ? null : id
    },
    getCount (code) {
      const count = this.stats.find((item) => {
        return item.country === code
      })
      return count
    },
    gymCurrentActive (code) {
      return this.getCount(code)?.gym?.current?.active || 0
    },
    gymCurrentTemporary (code) {
      return this.getCount(code)?.gym?.current?.temporary || 0
    },
    gymCurrentTotal (code) {
      return this.getCount(code)?.gym?.current?.total || 0
    },
    getCurrentAverage (code) {
      return (
        this.getCount(code)?.gym?.current?.total ||
        0 - this.getCount(code)?.gym?.previous?.total ||
        0 / this.getCount(code)?.gym?.current?.total ||
        0 * 100
      ).toFixed(2)
    },
    getContactActive (code) {
      return this.getCount(code)?.contact?.current?.active || 0
    },
    getContactTemporary (code) {
      return this.getCount(code)?.contact?.current?.temporary || 0
    },
    getContactTotal (code) {
      return this.getCount(code)?.contact?.current?.total || 0
    },
    getContactAverage (code) {
      return (
        this.getCount(code).contact?.current?.total ||
        0 - this.getCount(code).contact?.previous?.total ||
        0 / this.getCount(code).contact?.current?.total ||
        0 * 100
      ).toFixed(2)
    }
  }
}
</script>
