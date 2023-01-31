<template>
  <base-modal
    ref="modal"
    :title="$t('global.manage') + ' ' + $t('entities.bank')"
    :disabled="disabled"
    :loading="saving"
    @done="save"
  >
    <template #default>
      <base-form v-slot="{ rules }">
        <base-progressive-fields-container
          :data="draft"
          :fields="fields"
          :hidden-fields="hiddenFields"
          show-all-fields
          @can-save-change="disabled = !$event"
        >
          <template #countryCode="{ inputAttrs }">
            <cw-input-country
              v-model="draft.countryCode"
              v-bind="inputAttrs"
            />
          </template>

          <template #name="{ inputAttrs }">
            <base-input-text
              v-model="draft.name"
              :rules="[rules.maxLength(50)]"
              v-bind="inputAttrs"
            />
          </template>

          <template v-if="selectedCountry && selectedCountry.iban" #iban="{ inputAttrs }">
            <cw-input-iban
              v-model="draft.iban"
              v-bind="inputAttrs"
            />
          </template>

          <template v-if="selectedCountry && selectedCountry.bic" #bic="{ inputAttrs }">
            <base-input-text
              v-model="draft.bic"
              :rules="[v => !v || /^([a-zA-Z]){4}([a-zA-Z]){2}([0-9a-zA-Z]){2}([0-9a-zA-Z]{3})?$/.test(v) || 'Invalid BIC code']"
              input-class="uppercase"
              v-bind="inputAttrs"
            />
          </template>

          <template v-if="selectedCountry && selectedCountry.account" #account="{ inputAttrs }">
            <base-input-text
              v-model="draft.account"
              v-bind="inputAttrs"
            />
          </template>

          <template v-if="selectedCountry && selectedCountry.routingNumber" #routingNumber="{ inputAttrs }">
            <base-input-text
              v-model="draft.routingNumber"
              v-bind="inputAttrs"
            />
          </template>
        </base-progressive-fields-container>
      </base-form>
    </template>
  </base-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  inheritAttrs: false,
  data () {
    return {
      fields: [
        { name: 'countryCode', required: true },
        { name: 'name', required: true },
        { name: 'iban', required: true },
        { name: 'bic' },
        { name: 'account', required: true },
        { name: 'routingNumber' }
      ].map(f => Object.assign(f, {
        label: this.$t(`bank.${f.name}.label`),
        tooltip: this.$t(`bank.${f.name}.tooltip`)
      })),

      draft: {},

      disabled: true,
      saving: false
    }
  },
  computed: {
    ...mapGetters('country', ['localizedCountries']),

    hiddenFields () {
      return ['iban', 'bic', 'account', 'routingNumber'].filter(f => !this.selectedCountry?.[f])
    },

    selectedCountry () {
      const { countryCode } = this.draft
      return countryCode ? this.localizedCountries.find(c => c.code === countryCode) : null
    }
  },
  methods: {
    ...mapActions('country', ['getCountries']),

    async show (draft) {
      await this.getCountries()

      this.draft = this.$utils.extract(draft, {
        _id: undefined,
        name: null,
        countryCode: null,
        iban: null,
        bic: null,
        account: null,
        routingNumber: null
      })

      this.$refs.modal.show()
    },

    remove (index) {
      this.$confirm('Are you sure to delete this bank account?', () => {
        this.value.splice(index, 1)
      })
    },

    save () {
      this.saving = true

      const bank = this.$utils.extract(this.draft, [
        '_id',
        'name',
        'countryCode',
        'isActive',
        ...['iban', 'bic', 'account', 'routingNumber'].filter(f => this.selectedCountry && this.selectedCountry[f])
      ])

      this.$emit('done', bank)

      this.$refs.modal.hide()

      this.saving = false
    }
  }
}
</script>
