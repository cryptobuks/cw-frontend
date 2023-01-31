<template>
  <cw-country-setting-page-template
    :title="$t('pages.price_list')"
    :areas="areas"
    @mutate="mutateItem"
    @remove="removeItem"
    @activate="activateItem"
  >
    <template #item-body="{ item, area }">
      <p v-if="area.oneOff" v-auto-resize-text="{ tooltipOnly: true }">
        {{ $t('price_list.setup') }}: {{ item.oneOff }} {{ currencySymbol }} {{ $t('price_list.una_tantum') }}
      </p>

      <p v-if="area.forYear" v-auto-resize-text="{ tooltipOnly: true }">
        {{ $t('price_list.price') }}: {{ item.forYear }} {{ currencySymbol }} / {{ $t('price_list.year_per') }} {{ $t(area.paidKey) }}
      </p>
    </template>

    <template #modals="{ done }">
      <cw-general-country-document-maker
        ref="maker"
        v-slot="{ rules, entity, area }"
        entity-type="entities.price_list"
        :save="mutatePriceList"
        :areas="areas"
        @done="done"
      >
        <base-textarea
          v-model="entity.description"
          label="Description"
          placeholder="description"
        />

        <section class="text-center my-5">
          <h3 class="font-bold text-2xl mb-3 uppercase">
            {{ $t('price_list.price') }}
          </h3>

          <div v-if="!area || area.oneOff !== false" class="cw-price-list__payment">
            <span class="mx-2 whitespace-nowrap">{{ $t('price_list.setup') }}</span>
            <base-input-text
              v-model.number="entity.oneOff"
              :rules="[rules.required]"
              class="cw-price-list__payment__input"
              type="number"
            />
            <span class="mx-2">{{ $t('price_list.una_tantum') }}</span>
          </div>

          <div v-if="!area || area.forYear !== false" class="cw-price-list__payment">
            <span class="mx-2 whitespace-nowrap">{{ $t('price_list.price') }}</span>
            <base-input-text
              v-model.number="entity.forYear"
              :rules="[rules.required]"
              class="cw-price-list__payment__input"
              type="number"
            />
            <span class="mx-2">/ {{ $t('price_list.year_per') }} {{ $t(area ? area.paidKey : 'settings.countries.pricelist.activeContact') }}</span>
          </div>
        </section>

        <cw-editor-text-viewer v-if="contract" :value="contract.content" />
      </cw-general-country-document-maker>
    </template>

    <template #detail="{ item, area }">
      <div class="cw-price-list__detail">
        <section class="mb-10 text-center">
          <h3 class="cw-price-list__detail__title mb-2">
            {{ $t('price_list.description') }}
          </h3>

          <p>{{ item.description }}</p>
        </section>

        <section class="mb-10">
          <h3 class="cw-price-list__detail__title text-center">
            {{ $t('price_list.price') }}
          </h3>

          <div class="text-center text-black">
            <p v-if="area.oneOff">
              {{ $t('price_list.setup') }}: {{ item.oneOff }} {{ currencySymbol }} {{ $t('price_list.una_tantum') }}
            </p>
            <p v-if="area.forYear">
              {{ $t('price_list.price') }}: {{ item.forYear }} {{ currencySymbol }} / {{ $t('price_list.year_per') }} {{ $t(area.paidKey) }}
            </p>
            <p>{{ $t('price_list.active_from_signed') }}</p>
          </div>
        </section>

        <section>
          <!-- <h3 class="cw-price-list__detail__title">
            {{ $t('price_list.commercial_contract') }}
          </h3> -->

          <cw-editor-text-viewer :value="contract.content" class="text-black" />
        </section>
      </div>
    </template>
  </cw-country-setting-page-template>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  async fetch () {
    const promises = [
      this.getPriceListList({ countryId: this.$route.params.id })
    ]

    if (!this.$store.state.country.countrySettings.length) {
      promises.push(this.$store.dispatch('country/getCountrySettings'))
    }

    await Promise.all(promises)
  },
  computed: {
    ...mapState('country', ['countrySettings', 'contract', 'areas']),
    country () {
      return this.countrySettings.find(c => c._id === this.$route.params.id)
    },
    currencySymbol () {
      const { currency: { symbol = null } = {} } = this.country || {}
      return symbol
    }
  },
  methods: {
    ...mapActions('country', [
      'getPriceListList',
      'mutatePriceList',
      'removePriceList',
      'activatePriceList'
    ]),
    mutateItem ({ area, item, name }) {
      const readyItem = this.$utils.extract(item, {
        _id: undefined,
        countryId: this.$route.params.id,
        area: area ? area.name : null,
        description: null,
        oneOff: null,
        forYear: null
      })

      this.$refs.maker.show({ area, name, readyItem })
    },
    removeItem ({ area, item, name }) {
      this.$confirm(this.$t('global.confirm_remove', { name }))
        .then(() => this.removePriceList(item._id))
        .then(res => res.success && this.$notifier.success(res.message))
        .catch(() => {})
    },
    activateItem ({ area, item, name }) {
      this.$confirm(this.$t('price_list.confirm_activate', { name }))
        .then(() => this.activatePriceList(item._id))
        .then(res => res.success && this.$notifier.success(res.message))
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss">
.cw-price-list {
  &__detail {
    &__title {
      font-size: 22px;
      font-weight: bold;

      @apply text-black;
    }
  }

  &__payment {
    @apply mb-1 font-semibold text-xl justify-center items-center flex text-left;

    &__input {
      width: 120px;
      max-width: 120px;
    }
  }
}
</style>
