<template>
  <base-main-card
    :title="$t('nav.terms_of_payment')"
    :actions="[
      { icon: 'add', tooltip: $t('global.action_add_tooltip'), handler: () => openCreateModal() }
    ]"
    @search="keywords = $event"
  >
    <base-card-list-container :items="filteredTermsOfPayment">
      <template #item="{ item: term }">
        <base-swipe-card
          :title="term.name"
          @remove="onDelete(term._id)"
          @edit="openEditModal(term)"
        >
          <template #footer>
            <cw-translations-status :translations="term.translations" />

            <span v-if="term.isEom" class="text-white">{{ term.day }} EOM</span>
            <span v-else class="text-white">{{ term.day }} DAY/S</span>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>

    <cw-payment-term-maker ref="paymentTermMaker" :languages="languages" />
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  meta: {
    permission: 'settings.termsOfPayment'
  },
  data () {
    return {
      keywords: '',
      isSearchOpened: false
    }
  },
  computed: {
    ...mapGetters({
      termsOfPayment: 'settings/termsOfPayment',
      languages: 'settings/languages'
    }),
    filteredTermsOfPayment () {
      if (this.keywords) {
        const keywords = this.keywords.toLowerCase()
        const terms = this.termsOfPayment.filter((term) => {
          const translation = Object.values(term.translations)
          return term.name.toLowerCase().includes(keywords) || translation.some(trans => trans && trans.toLowerCase().includes(keywords))
        })
        return this.$utils.sortBy(terms, 'name')
      }
      return this.$utils.sortBy(this.termsOfPayment.slice(), 'name')
    }
  },
  mounted () {
    this.getTermsOfPayment()
    this.getLanguages()
  },
  methods: {
    ...mapActions({
      getTermsOfPayment: 'settings/getTermsOfPayment',
      deleteTermOfPayment: 'settings/deleteTermOfPayment',
      getLanguages: 'settings/getLanguages'
    }),
    toggleSearchInput () {
      this.isSearchOpened = !this.isSearchOpened
    },
    openCreateModal () {
      this.$refs.paymentTermMaker.show()
    },
    openEditModal (termOfPayment) {
      this.$refs.paymentTermMaker.show(termOfPayment)
    },
    onDelete (id) {
      this.$confirm({
        text: this.$t('term_payment.confirm_remove')
      }, () => {
        this.deleteTermOfPayment(id).then((response) => {
          response.success ? this.$notifier.success(response.message) : this.$notifier.error(response.message)
        })
      })
    }
  }
}
</script>
